// ────────────────────────────────────────────────────────────────────
// Core upload engine — shared by useUpload and useMultipleUpload.
// Framework-agnostic: no React imports, no hooks, no state.
// ────────────────────────────────────────────────────────────────────

// ── Error types ─────────────────────────────────────────────────────

/** Structured error codes emitted by the upload hooks. */
export type UploadErrorCode =
  | "FILE_TOO_LARGE"
  | "FILE_TYPE_NOT_ALLOWED"
  | "GET_URL_FAILED"
  | "UPLOAD_FAILED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "ABORTED";

/**
 * A typed error thrown (and surfaced via `error`) by the upload hooks.
 * Consumers can switch on `code` for programmatic handling.
 */
export class UploadError extends Error {
  /** Machine-readable error code. */
  readonly code: UploadErrorCode;
  /** The HTTP status code, if the failure was an HTTP error. */
  readonly status?: number;

  constructor(code: UploadErrorCode, message: string, status?: number) {
    super(message);
    this.name = "UploadError";
    this.code = code;
    this.status = status;
  }
}

// ── Shared options base ─────────────────────────────────────────────

/**
 * Core configuration shared by both `useUpload` and `useMultipleUpload`.
 * Each hook extends this with hook-specific options.
 */
export interface UploadCoreOptions {
  /**
   * Maximum allowed file size **in bytes**.
   * @default Infinity
   */
  maxFileSize?: number;

  /**
   * Allowed MIME types (e.g. `["image/png", "image/jpeg"]`).
   * Supports wildcard subtypes such as `"image/*"`.
   * @default undefined — all types allowed
   */
  allowedTypes?: string[];

  /**
   * Upload timeout **in milliseconds**. Set to `0` to disable.
   * @default 0
   */
  timeout?: number;

  /**
   * Number of automatic retries on **transient failures**:
   * network errors, timeouts, HTTP 429, and HTTP 5xx.
   * @default 0
   */
  retries?: number;

  /**
   * Base delay in ms for exponential back-off between retries.
   * Actual delay = `retryDelay × 2^attempt` (capped at 30 s).
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Extra headers to send with the PUT request.
   * `Content-Type` is set automatically from the file's MIME type
   * unless you provide an explicit `Content-Type` key here.
   */
  headers?: Record<string, string>;

  /**
   * An `AbortSignal` for external cancellation (e.g. from an `AbortController`,
   * React Query, or TanStack Query). When the signal fires, the in-flight XHR
   * is aborted immediately. Works alongside the hook's built-in `abort()` method.
   */
  signal?: AbortSignal;
}

// ── Constants ───────────────────────────────────────────────────────

const MAX_BACKOFF_MS = 30_000;

/** HTTP status codes that are safe to retry automatically. */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

// ── Helpers ─────────────────────────────────────────────────────────

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function matchesMimeType(fileType: string, pattern: string): boolean {
  if (pattern === fileType) return true;
  if (pattern.endsWith("/*")) {
    const [type] = pattern.split("/");
    return fileType.startsWith(type + "/");
  }
  return false;
}

/** Parse the Retry-After header (seconds or HTTP-date) into milliseconds. */
function parseRetryAfter(xhr: XMLHttpRequest): number | null {
  const header = xhr.getResponseHeader?.("Retry-After");
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

// ── File validation ─────────────────────────────────────────────────

/**
 * Validates a file against size and type constraints.
 * Returns `null` if valid, or an `UploadError` if not.
 */
export function validateFile(
  file: File,
  maxFileSize: number,
  allowedTypes?: string[],
): UploadError | null {
  if (file.size > maxFileSize) {
    return new UploadError(
      "FILE_TOO_LARGE",
      `File size ${file.size} bytes exceeds the ${maxFileSize} byte limit`,
    );
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const typeAllowed = allowedTypes.some((pattern) =>
      matchesMimeType(file.type, pattern),
    );
    if (!typeAllowed) {
      return new UploadError(
        "FILE_TYPE_NOT_ALLOWED",
        `File type "${file.type || "unknown"}" is not in the allowed list: ${allowedTypes.join(", ")}`,
      );
    }
  }

  return null;
}

// ── XHR upload engine ───────────────────────────────────────────────

/** Callbacks injected by the calling hook to observe XHR lifecycle. */
export interface XhrCallbacks {
  /** Called when the XHR is created so the caller can store/track it. */
  onXhrCreated: (xhr: XMLHttpRequest) => void;
  /** Called when the XHR is finished (load/error/timeout/abort). */
  onXhrDone: () => void;
  /** Called on every progress event with loaded bytes and total bytes. */
  onProgress: (loaded: number, total: number) => void;
  /**
   * Should return `true` if this upload is stale and should bail.
   * Checked before each retry attempt and inside XHR handlers.
   */
  isStale: () => boolean;
}

/** Options for a single XHR upload attempt. */
export interface XhrUploadOptions {
  file: File;
  presignedUrl: string;
  fields?: Record<string, string>;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  callbacks: XhrCallbacks;
}

/**
 * Result of a single file XHR upload.
 * `ok: true` means HTTP 2xx.
 */
export type XhrUploadResult =
  | { ok: true }
  | { ok: false; code: UploadErrorCode; message: string; status?: number };

/**
 * Uploads a single file to a presigned URL via XHR, with retry logic.
 * This is the low-level engine used by both hooks.
 */
export function uploadFileXhr(
  opts: XhrUploadOptions,
): Promise<XhrUploadResult> {
  const {
    file,
    presignedUrl,
    fields,
    timeout,
    retries,
    retryDelay,
    headers,
    signal,
    callbacks,
  } = opts;

  const contentType = file.type || "application/octet-stream";

  const attemptUpload = (attempt: number): Promise<XhrUploadResult> =>
    new Promise<XhrUploadResult>((resolve) => {
      if (callbacks.isStale() || signal?.aborted) {
        resolve({ ok: false, code: "ABORTED", message: "Upload aborted" });
        return;
      }

      const xhr = new XMLHttpRequest();
      callbacks.onXhrCreated(xhr);

      let signalCleanup: (() => void) | undefined;
      if (signal) {
        const onAbort = () => xhr.abort();
        signal.addEventListener("abort", onAbort, { once: true });
        signalCleanup = () => signal.removeEventListener("abort", onAbort);
      }

      let done = false;
      const safeDone = () => {
        if (!done) {
          done = true;
          signalCleanup?.();
          callbacks.onXhrDone();
        }
      };

      const isPost = Boolean(fields && Object.keys(fields).length > 0);
      xhr.open(isPost ? "POST" : "PUT", presignedUrl, true);

      if (!isPost) {
        const hasContentType = Object.keys(headers ?? {}).some(
          (k) => k.toLowerCase() === "content-type",
        );

        if (!hasContentType) {
          xhr.setRequestHeader("Content-Type", contentType);
        }

        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            xhr.setRequestHeader(key, value);
          }
        }
      }

      if (timeout > 0) {
        xhr.timeout = timeout;
      }

      xhr.upload.onprogress = (e) => {
        if (callbacks.isStale()) return;
        if (e.lengthComputable) {
          callbacks.onProgress(e.loaded, e.total);
        }
      };

      const retryOrFail = (
        code: UploadErrorCode,
        message: string,
        httpStatus?: number,
        backoffOverrideMs?: number,
      ) => {
        if (attempt < retries) {
          const backoff =
            backoffOverrideMs ??
            Math.min(retryDelay * Math.pow(2, attempt), MAX_BACKOFF_MS);

          delay(backoff).then(() => {
            if (callbacks.isStale() || signal?.aborted) {
              resolve({
                ok: false,
                code: "ABORTED",
                message: "Upload aborted",
              });
              return;
            }
            attemptUpload(attempt + 1).then(resolve);
          });
        } else {
          resolve({ ok: false, code, message, status: httpStatus });
        }
      };

      const isFinalAttempt = attempt >= retries;

      xhr.onload = () => {
        safeDone();

        if (callbacks.isStale()) {
          resolve({ ok: false, code: "ABORTED", message: "Upload aborted" });
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true });
        } else if (RETRYABLE_STATUS_CODES.has(xhr.status)) {
          const retryAfterMs =
            xhr.status === 429
              ? (parseRetryAfter(xhr) ?? undefined)
              : undefined;

          const msg = isFinalAttempt
            ? `Upload failed with HTTP ${xhr.status} after ${attempt + 1} attempts`
            : `Upload failed with HTTP ${xhr.status}, retrying...`;

          retryOrFail("UPLOAD_FAILED", msg, xhr.status, retryAfterMs);
        } else {
          resolve({
            ok: false,
            code: "UPLOAD_FAILED",
            message: `Upload failed with HTTP ${xhr.status}: ${xhr.statusText || "Unknown error"}`,
            status: xhr.status,
          });
        }
      };

      xhr.onerror = () => {
        safeDone();

        if (callbacks.isStale()) {
          resolve({ ok: false, code: "ABORTED", message: "Upload aborted" });
          return;
        }

        const msg = isFinalAttempt
          ? `Network error after ${attempt + 1} attempts`
          : "Network error, retrying...";

        retryOrFail("NETWORK_ERROR", msg);
      };

      xhr.ontimeout = () => {
        safeDone();

        if (callbacks.isStale()) {
          resolve({ ok: false, code: "ABORTED", message: "Upload aborted" });
          return;
        }

        const msg = isFinalAttempt
          ? `Upload timed out after ${attempt + 1} attempts`
          : `Upload timed out after ${timeout}ms, retrying...`;

        retryOrFail("TIMEOUT", msg);
      };

      xhr.onabort = () => {
        safeDone();
        resolve({ ok: false, code: "ABORTED", message: "Upload aborted" });
      };

      if (isPost && fields) {
        const formData = new FormData();

        Object.entries(fields).forEach(([k, v]) => {
          formData.append(k, v);
        });

        if (!Object.prototype.hasOwnProperty.call(fields, "Content-Type")) {
          formData.append("Content-Type", contentType);
        }

        formData.append("file", file);
        xhr.send(formData);
      } else {
        xhr.send(file);
      }
    });

  return attemptUpload(0);
}
