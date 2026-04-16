import { useRef, useState, useCallback, useEffect } from "react";
import { GetUploadUrl, GetUploadUrlResponse } from "./types";
import {
  UploadError,
  validateFile,
  uploadFileXhr,
} from "./core";
import type { UploadCoreOptions, UploadErrorCode } from "./core";

// ────────────────────────────────────────────────────────────────────
// Re-exports so consumers don't need to import from core
// ────────────────────────────────────────────────────────────────────

export { UploadError };
export type { UploadErrorCode };

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

/** Discriminated upload lifecycle status. */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

/** Configuration options accepted by `useUpload`. */
export interface UseUploadOptions extends UploadCoreOptions {
  /**
   * Optional callback fired on every progress event.
   * Useful when you need to feed progress into external stores (Zustand, etc.)
   * without triggering a React re-render.
   */
  onProgress?: (progress: number) => void;
}

export interface UseUploadReturn<TMeta> {
  /** Initiate a file upload. */
  upload: (file: File, getUploadUrl: GetUploadUrl<TMeta>) => Promise<TMeta>;
  /** Cancel the in-flight upload. */
  abort: () => void;
  /** Reset the hook to its initial idle state. */
  reset: () => void;
  /** Upload progress percentage (0 – 100). */
  progress: number;
  /** Whether an upload is currently in flight. */
  isUploading: boolean;
  /** Lifecycle status: `idle` → `uploading` → `success` | `error`. */
  status: UploadStatus;
  /** The last `UploadError`, or `null`. */
  error: UploadError | null;
}

// ────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────

/**
 * React hook for uploading a single file to a presigned URL with
 * real-time progress tracking, automatic retries, timeouts, and
 * file validation.
 *
 * @template TMeta - The shape of the metadata your backend returns.
 *
 * @example
 * ```tsx
 * const { upload, progress, isUploading, status, error, abort, reset } =
 *   useUpload<{ key: string }>({
 *     maxFileSize: 10 * 1024 * 1024, // 10 MB
 *     allowedTypes: ["image/*"],
 *     timeout: 60_000,
 *     retries: 2,
 *   });
 *
 * const handleUpload = async (file: File) => {
 *   try {
 *     const meta = await upload(file, async (f) => {
 *       const res = await fetch(`/api/presign?name=${f.name}`);
 *       return res.json();
 *     });
 *     console.log("Uploaded:", meta.key);
 *   } catch (err) {
 *     if (err instanceof UploadError && err.code === "ABORTED") return;
 *     console.error(err);
 *   }
 * };
 * ```
 */
export function useUpload<TMeta = unknown>(
  options: UseUploadOptions = {},
): UseUploadReturn<TMeta> {
  const {
    maxFileSize = Infinity,
    allowedTypes,
    timeout = 0,
    retries = 0,
    retryDelay = 1000,
    headers,
    signal,
    onProgress,
  } = options;

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<UploadError | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const abortedRef = useRef(false);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  // Stable ref for the onProgress callback
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // Track mount / unmount — must set `true` in the setup phase
  // so that React 18 Strict Mode's cleanup → re-run cycle works.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      xhrRef.current?.abort();
      xhrRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    abortedRef.current = false;
    setProgress(0);
    setIsUploading(false);
    setStatus("idle");
    setError(null);
  }, []);

  const abort = useCallback(() => {
    abortedRef.current = true;
    xhrRef.current?.abort();
    xhrRef.current = null;
  }, []);

  const upload = useCallback(
    async (
      file: File,
      getUploadUrl: GetUploadUrl<TMeta>,
    ): Promise<TMeta> => {
      // Abort any previous in-flight upload
      if (xhrRef.current) {
        xhrRef.current.abort();
        xhrRef.current = null;
      }

      const currentRequestId = ++requestIdRef.current;
      abortedRef.current = false;
      setProgress(0);
      setError(null);
      setIsUploading(true);
      setStatus("uploading");

      const isStale = () =>
        !isMountedRef.current ||
        abortedRef.current ||
        currentRequestId !== requestIdRef.current;

      // ── File validation ──────────────────────────────────────────
      const validationErr = validateFile(file, maxFileSize, allowedTypes);
      if (validationErr) {
        setIsUploading(false);
        setStatus("error");
        setError(validationErr);
        throw validationErr;
      }

      // ── Presigned URL retrieval ──────────────────────────────────
      let uploadData: GetUploadUrlResponse<TMeta>;
      try {
        uploadData = await getUploadUrl(file);
      } catch {
        const err = new UploadError(
          "GET_URL_FAILED",
          "Failed to retrieve the presigned upload URL",
        );
        setIsUploading(false);
        setStatus("error");
        setError(err);
        throw err;
      }

      if (isStale()) {
        const err = new UploadError("ABORTED", "Upload aborted");
        setIsUploading(false);
        setStatus("idle");
        throw err;
      }

      if (!uploadData?.presignedUrl) {
        const err = new UploadError(
          "GET_URL_FAILED",
          "Invalid presigned URL response: missing presignedUrl",
        );
        setIsUploading(false);
        setStatus("error");
        setError(err);
        throw err;
      }

      const { presignedUrl, meta } = uploadData;

      // ── XHR via core engine ──────────────────────────────────────
      const result = await uploadFileXhr({
        file,
        presignedUrl,
        timeout,
        retries,
        retryDelay,
        headers,
        signal,
        callbacks: {
          isStale,
          onXhrCreated: (xhr) => { xhrRef.current = xhr; },
          onXhrDone: () => { xhrRef.current = null; },
          onProgress: (_loaded, total) => {
            if (isStale()) return;
            const pct = total > 0 ? Math.round((_loaded / total) * 100) : 0;
            setProgress(pct);
            onProgressRef.current?.(pct);
          },
        },
      });

      if (result.ok) {
        setProgress(100);
        setIsUploading(false);
        setStatus("success");
        setError(null);
        return meta;
      }

      // ── Handle failure ───────────────────────────────────────────
      const uploadErr = new UploadError(result.code, result.message, result.status);

      if (result.code === "ABORTED") {
        setIsUploading(false);
        setStatus("idle");
        setProgress(0);
        setError(null);
      } else {
        setIsUploading(false);
        setStatus("error");
        setError(uploadErr);
      }

      throw uploadErr;
    },
    [maxFileSize, allowedTypes, timeout, retries, retryDelay, headers, signal],
  );

  return {
    upload,
    abort,
    reset,
    progress,
    isUploading,
    status,
    error,
  };
}
