import { useRef, useState, useCallback, useEffect } from "react";
import { GetUploadUrl, GetUploadUrlResponse } from "./types";
import { UploadError, validateFile, uploadFileXhr } from "./core";
import type { UploadCoreOptions, UploadErrorCode } from "./core";

// ────────────────────────────────────────────────────────────────────
// Re-exports so consumers don't need to import from core
// ────────────────────────────────────────────────────────────────────

export { UploadError };
export type { UploadErrorCode };

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UseUploadOptions extends UploadCoreOptions {
  onProgress?: (progress: number) => void;
}

export interface UseUploadReturn<TMeta> {
  upload: (file: File, getUploadUrl: GetUploadUrl<TMeta>) => Promise<TMeta>;
  abort: () => void;
  reset: () => void;
  progress: number;
  isUploading: boolean;
  status: UploadStatus;
  error: UploadError | null;
}

// ────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────

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

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      xhrRef.current?.abort();
      xhrRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    requestIdRef.current++;
    abortedRef.current = false;
    xhrRef.current?.abort();
    xhrRef.current = null;
    setProgress(0);
    setIsUploading(false);
    setStatus("idle");
    setError(null);
  }, []);

  const abort = useCallback(() => {
    abortedRef.current = true;
    xhrRef.current?.abort();
    xhrRef.current = null;
    setIsUploading(false);
    setStatus("idle");
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File, getUploadUrl: GetUploadUrl<TMeta>): Promise<TMeta> => {
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

      // FIX: Helper safely settles state whether aborted manually OR externally via AbortSignal
      const settleIdleIfCurrent = () => {
        if (!isMountedRef.current) return;
        if (currentRequestId !== requestIdRef.current) return;
        setIsUploading(false);
        setStatus("idle");
        setProgress(0);
        setError(null);
      };

      const validationErr = validateFile(file, maxFileSize, allowedTypes);
      if (validationErr) {
        setIsUploading(false);
        setStatus("error");
        setError(validationErr);
        throw validationErr;
      }

      let uploadData: GetUploadUrlResponse<TMeta>;
      try {
        uploadData = await getUploadUrl(file);
      } catch {
        if (isStale()) {
          settleIdleIfCurrent();
          throw new UploadError("ABORTED", "Upload aborted");
        }

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
        settleIdleIfCurrent();
        throw new UploadError("ABORTED", "Upload aborted");
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

      const { presignedUrl, meta, fields } = uploadData;

      const result = await uploadFileXhr({
        file,
        presignedUrl,
        fields,
        timeout,
        retries,
        retryDelay,
        headers,
        signal, // The external AbortSignal passed into the options
        callbacks: {
          isStale,
          onXhrCreated: (xhr) => {
            xhrRef.current = xhr;
          },
          onXhrDone: () => {
            xhrRef.current = null;
          },
          onProgress: (_loaded, total) => {
            if (isStale()) return;
            const pct = total > 0 ? Math.round((_loaded / total) * 100) : 0;
            setProgress(pct);
            onProgressRef.current?.(pct);
          },
        },
      });

      if (isStale()) {
        settleIdleIfCurrent();
        throw new UploadError("ABORTED", "Upload aborted");
      }

      if (result.ok) {
        setProgress(100);
        setIsUploading(false);
        setStatus("success");
        setError(null);
        return meta;
      }

      const uploadErr = new UploadError(
        result.code,
        result.message,
        result.status,
      );

      // FIX: Catches external abort signals correctly without relying on `abortedRef`
      if (result.code === "ABORTED") {
        settleIdleIfCurrent();
        throw new UploadError("ABORTED", "Upload aborted");
      }

      setIsUploading(false);
      setStatus("error");
      setError(uploadErr);

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
