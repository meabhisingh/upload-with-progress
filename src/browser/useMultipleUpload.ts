import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type {
  GetUploadUrlResponse,
  MultipleUploadResult,
  UploadJob,
} from "./types";
import {
  validateFile,
  uploadFileXhr,
} from "./core";
import type { UploadCoreOptions } from "./core";

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

/** Configuration options accepted by `useMultipleUpload`. */
export interface UseMultipleUploadOptions extends UploadCoreOptions {
  /**
   * Maximum number of files uploaded concurrently.
   * For example, `concurrency: 3` uploads at most 3 files at a time.
   * @default Infinity — all files start immediately
   */
  concurrency?: number;
}

export interface UseMultipleUploadReturn<TMeta> {
  /** Initiate a batch upload. */
  upload: (
    files: File[],
    getUploadUrl: (
      file: File,
      index: number,
    ) => Promise<GetUploadUrlResponse<TMeta>>,
  ) => Promise<MultipleUploadResult<TMeta>[]>;
  /** Cancel a single upload by job ID. */
  abort: (id: string) => void;
  /** Cancel all in-flight uploads. */
  abortAll: () => void;
  /** Reset the hook to its initial idle state, aborting all uploads. */
  reset: () => void;
  /** Per-file job states. */
  jobs: UploadJob<TMeta>[];
  /** Weighted overall progress (0 – 100). */
  overallProgress: number;
  /** Whether any upload is currently in flight. */
  isUploadingAll: boolean;
}

// ────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────

/**
 * React hook for uploading **multiple files** with per-file progress,
 * automatic retries, timeouts, concurrency control, and file validation.
 *
 * @template TMeta - The shape of the metadata your backend returns per file.
 *
 * @example
 * ```tsx
 * const { upload, jobs, overallProgress, abortAll, reset } =
 *   useMultipleUpload<{ key: string }>({
 *     maxFileSize: 50 * 1024 * 1024,
 *     allowedTypes: ["image/*", "video/*"],
 *     timeout: 120_000,
 *     retries: 2,
 *     concurrency: 3,
 *   });
 *
 * const handleUpload = async (files: File[]) => {
 *   const results = await upload(files, async (file, index) => {
 *     const res = await fetch(`/api/presign?name=${file.name}`);
 *     return res.json();
 *   });
 *   const succeeded = results.filter(r => r.status === "fulfilled");
 *   console.log(`${succeeded.length}/${results.length} uploaded`);
 * };
 * ```
 */
export function useMultipleUpload<TMeta = unknown>(
  options: UseMultipleUploadOptions = {},
): UseMultipleUploadReturn<TMeta> {
  const {
    maxFileSize = Infinity,
    allowedTypes,
    timeout = 0,
    retries = 0,
    retryDelay = 1000,
    headers,
    signal,
    concurrency = Infinity,
  } = options;

  const [jobs, setJobs] = useState<UploadJob<TMeta>[]>([]);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const xhrRefs = useRef<Map<string, XMLHttpRequest>>(new Map());
  const isMountedRef = useRef(true);
  const batchIdRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      xhrRefs.current.forEach((xhr) => xhr.abort());
      xhrRefs.current.clear();
    };
  }, []);

  // ── Derived: overall weighted progress ────────────────────────────
  const overallProgress = useMemo(() => {
    if (jobs.length === 0) return 0;
    let totalLoadedBytes = 0;
    let totalBytes = 0;
    jobs.forEach((job) => {
      totalLoadedBytes += job.loaded;
      totalBytes += job.total;
    });
    return totalBytes === 0
      ? 0
      : Math.round((totalLoadedBytes / totalBytes) * 100);
  }, [jobs]);

  // ── Helper: patch a single job in state ───────────────────────────
  const updateJob = useCallback(
    (jobId: string, patch: Partial<UploadJob<TMeta>>) => {
      if (!isMountedRef.current) return;
      setJobs((prev) =>
        prev.map((p) => (p.id === jobId ? { ...p, ...patch } : p)),
      );
    },
    [],
  );

  // ── abort / abortAll / reset ──────────────────────────────────────
  const abort = useCallback((id: string) => {
    const xhr = xhrRefs.current.get(id);
    if (xhr) {
      xhr.abort();
      xhrRefs.current.delete(id);
    }
  }, []);

  const abortAll = useCallback(() => {
    xhrRefs.current.forEach((xhr) => xhr.abort());
    xhrRefs.current.clear();
  }, []);

  const reset = useCallback(() => {
    xhrRefs.current.forEach((xhr) => xhr.abort());
    xhrRefs.current.clear();
    batchIdRef.current++;
    setJobs([]);
    setIsUploadingAll(false);
  }, []);

  // ── upload ────────────────────────────────────────────────────────
  const upload = useCallback(
    async (
      files: File[],
      getUploadUrl: (
        file: File,
        index: number,
      ) => Promise<GetUploadUrlResponse<TMeta>>,
    ): Promise<MultipleUploadResult<TMeta>[]> => {
      const currentBatchId = ++batchIdRef.current;

      const isBatchStale = () =>
        !isMountedRef.current || currentBatchId !== batchIdRef.current;

      // ── File pre-validation ──────────────────────────────────────
      const newJobs: UploadJob<TMeta>[] = [];
      const earlyResults: (MultipleUploadResult<TMeta> | null)[] = [];

      files.forEach((file, index) => {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${file.name}-${Date.now()}-${index}`;

        const validationErr = validateFile(file, maxFileSize, allowedTypes);

        if (validationErr) {
          newJobs.push({
            id,
            file,
            progress: 0,
            loaded: 0,
            total: file.size,
            isUploading: false,
            error: validationErr.message,
          });
          earlyResults.push({
            status: "rejected",
            file,
            error: validationErr.message,
          });
        } else {
          newJobs.push({
            id,
            file,
            progress: 0,
            loaded: 0,
            total: file.size,
            isUploading: true,
            error: null,
          });
          earlyResults.push(null); // placeholder
        }
      });

      setJobs((prev) => [...prev, ...newJobs]);
      setIsUploadingAll(true);

      const uploadableIndices = earlyResults
        .map((r, i) => (r === null ? i : -1))
        .filter((i) => i >= 0);

      // ── Per-job upload via core engine ────────────────────────────
      const uploadSingleJob = async (
        jobIndex: number,
      ): Promise<MultipleUploadResult<TMeta>> => {
        const job = newJobs[jobIndex];

        // Presigned URL retrieval
        let uploadData: GetUploadUrlResponse<TMeta>;
        try {
          uploadData = await getUploadUrl(job.file, jobIndex);
        } catch {
          const errMsg = "Failed to get upload URL";
          updateJob(job.id, { isUploading: false, error: errMsg });
          return { status: "rejected", file: job.file, error: errMsg };
        }

        if (isBatchStale()) {
          return { status: "rejected", file: job.file, error: "Aborted" };
        }

        if (!uploadData?.presignedUrl) {
          const errMsg = "Invalid presigned URL response";
          updateJob(job.id, { isUploading: false, error: errMsg });
          return { status: "rejected", file: job.file, error: errMsg };
        }

        const { presignedUrl, meta } = uploadData;

        // Delegate to core XHR engine
        const result = await uploadFileXhr({
          file: job.file,
          presignedUrl,
          timeout,
          retries,
          retryDelay,
          headers,
          signal,
          callbacks: {
            isStale: isBatchStale,
            onXhrCreated: (xhr) => { xhrRefs.current.set(job.id, xhr); },
            onXhrDone: () => { xhrRefs.current.delete(job.id); },
            onProgress: (loaded, total) => {
              if (isBatchStale()) return;
              updateJob(job.id, {
                loaded,
                progress: total > 0 ? Math.round((loaded / total) * 100) : 0,
              });
            },
          },
        });

        if (result.ok) {
          updateJob(job.id, {
            isUploading: false,
            progress: 100,
            loaded: job.total,
            meta,
          });
          return { status: "fulfilled", file: job.file, meta };
        }

        // Failure
        updateJob(job.id, { isUploading: false, error: result.message });
        return { status: "rejected", file: job.file, error: result.message };
      };

      // ── Execute with concurrency control ─────────────────────────
      const results = [...earlyResults] as MultipleUploadResult<TMeta>[];

      if (concurrency >= uploadableIndices.length) {
        // Fast path — all at once
        const promises = uploadableIndices.map((i) => uploadSingleJob(i));
        const uploadResults = await Promise.all(promises);
        uploadResults.forEach((r, idx) => {
          results[uploadableIndices[idx]] = r;
        });
      } else {
        // Concurrency-limited path
        let cursor = 0;
        const runNext = async (): Promise<void> => {
          while (cursor < uploadableIndices.length) {
            if (isBatchStale()) return;
            const idx = uploadableIndices[cursor++];
            results[idx] = await uploadSingleJob(idx);
          }
        };
        const workers = Array.from(
          { length: Math.min(concurrency, uploadableIndices.length) },
          () => runNext(),
        );
        await Promise.all(workers);
      }

      // All jobs in this batch have settled. Only flip isUploadingAll off
      // if this is still the active batch (a newer upload() call owns the flag).
      if (isMountedRef.current && !isBatchStale()) {
        setIsUploadingAll(false);
      }

      return results;
    },
    [maxFileSize, allowedTypes, timeout, retries, retryDelay, headers, signal, concurrency, updateJob],
  );

  return {
    upload,
    abort,
    abortAll,
    reset,
    jobs,
    overallProgress,
    isUploadingAll,
  };
}
