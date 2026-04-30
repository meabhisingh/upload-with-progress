import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type {
  GetUploadUrlResponse,
  MultipleUploadResult,
  UploadJob,
} from "./types";
import { validateFile, uploadFileXhr } from "./core";
import type { UploadCoreOptions } from "./core";

export interface UseMultipleUploadOptions extends UploadCoreOptions {
  concurrency?: number;
  clearOnNewUpload?: boolean;
}

export interface UseMultipleUploadReturn<TMeta> {
  upload: (
    files: File[],
    getUploadUrl: (
      file: File,
      index: number,
    ) => Promise<GetUploadUrlResponse<TMeta>>,
  ) => Promise<MultipleUploadResult<TMeta>[]>;
  abort: (id: string) => void;
  abortAll: () => void;
  reset: () => void;
  jobs: UploadJob<TMeta>[];
  overallProgress: number;
  isUploadingAll: boolean;
}

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
    clearOnNewUpload = false,
  } = options;

  const [jobs, setJobs] = useState<UploadJob<TMeta>[]>([]);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const xhrRefs = useRef<Map<string, XMLHttpRequest>>(new Map());
  const isMountedRef = useRef(true);
  const batchIdRef = useRef(0);

  // Tracks only jobs that should participate in overall progress.
  const currentBatchJobIdsRef = useRef<Set<string>>(new Set());

  // Tracks explicit per-job aborts, including "abort before presign returns".
  const explicitlyAbortedJobIdsRef = useRef<Set<string>>(new Set());

  const normalizedConcurrency = useMemo(() => {
    if (!Number.isFinite(concurrency)) return Infinity;
    return Math.max(1, Math.floor(concurrency));
  }, [concurrency]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      xhrRefs.current.forEach((xhr) => xhr.abort());
      xhrRefs.current.clear();
    };
  }, []);

  const overallProgress = useMemo(() => {
    const activeJobs = jobs.filter((j) =>
      currentBatchJobIdsRef.current.has(j.id),
    );
    if (activeJobs.length === 0) return 0;

    let totalLoadedBytes = 0;
    let totalBytes = 0;

    for (const job of activeJobs) {
      totalLoadedBytes += job.loaded;
      totalBytes += job.total;
    }

    return totalBytes === 0
      ? 0
      : Math.round((totalLoadedBytes / totalBytes) * 100);
  }, [jobs]);

  const updateJob = useCallback(
    (jobId: string, patch: Partial<UploadJob<TMeta>>) => {
      if (!isMountedRef.current) return;
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, ...patch } : job)),
      );
    },
    [],
  );

  const abortTrackedXhrs = useCallback(() => {
    xhrRefs.current.forEach((xhr) => xhr.abort());
    xhrRefs.current.clear();
  }, []);

  const abort = useCallback(
    (id: string) => {
      explicitlyAbortedJobIdsRef.current.add(id);
      currentBatchJobIdsRef.current.delete(id);

      const xhr = xhrRefs.current.get(id);
      if (xhr) {
        xhr.abort();
        xhrRefs.current.delete(id);
      }

      updateJob(id, { isUploading: false, error: "Aborted" });
    },
    [updateJob],
  );

  const abortAll = useCallback(() => {
    batchIdRef.current++;
    abortTrackedXhrs();
    explicitlyAbortedJobIdsRef.current.clear();
    currentBatchJobIdsRef.current.clear();

    setJobs((prev) =>
      prev.map((job) =>
        job.isUploading
          ? { ...job, isUploading: false, error: "Aborted" }
          : job,
      ),
    );

    setIsUploadingAll(false);
  }, [abortTrackedXhrs]);

  const reset = useCallback(() => {
    batchIdRef.current++;
    abortTrackedXhrs();
    explicitlyAbortedJobIdsRef.current.clear();
    currentBatchJobIdsRef.current.clear();
    setJobs([]);
    setIsUploadingAll(false);
  }, [abortTrackedXhrs]);

  const upload = useCallback(
    async (
      files: File[],
      getUploadUrl: (
        file: File,
        index: number,
      ) => Promise<GetUploadUrlResponse<TMeta>>,
    ): Promise<MultipleUploadResult<TMeta>[]> => {
      if (files.length === 0) return [];

      // Supersede the previous batch immediately.
      batchIdRef.current++;
      const currentBatchId = batchIdRef.current;

      abortTrackedXhrs();
      explicitlyAbortedJobIdsRef.current.clear();

      const newBatchIds = new Set<string>();
      currentBatchJobIdsRef.current = newBatchIds;

      const isBatchStale = () =>
        !isMountedRef.current || currentBatchId !== batchIdRef.current;

      const newJobs: UploadJob<TMeta>[] = [];
      const earlyResults: (MultipleUploadResult<TMeta> | null)[] = [];

      files.forEach((file, index) => {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${file.name}-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;

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

          return;
        }

        newBatchIds.add(id);

        newJobs.push({
          id,
          file,
          progress: 0,
          loaded: 0,
          total: file.size,
          isUploading: true,
          error: null,
        });

        earlyResults.push(null);
      });

      setJobs((prev) => {
        if (clearOnNewUpload) return newJobs;

        const settledPrev = prev.map((job) =>
          job.isUploading
            ? { ...job, isUploading: false, error: "Aborted" }
            : job,
        );

        return [...settledPrev, ...newJobs];
      });

      setIsUploadingAll(true);

      const uploadableIndices = earlyResults
        .map((result, index) => (result === null ? index : -1))
        .filter((index) => index >= 0);

      if (uploadableIndices.length === 0) {
        setIsUploadingAll(false);
        return earlyResults as MultipleUploadResult<TMeta>[];
      }

      const uploadSingleJob = async (
        jobIndex: number,
      ): Promise<MultipleUploadResult<TMeta>> => {
        const job = newJobs[jobIndex];
        const rejectAborted = (): MultipleUploadResult<TMeta> => ({
          status: "rejected",
          file: job.file,
          error: "Aborted",
        });

        const isJobExplicitlyAborted = () =>
          explicitlyAbortedJobIdsRef.current.has(job.id);

        try {
          if (isBatchStale() || isJobExplicitlyAborted()) {
            updateJob(job.id, { isUploading: false, error: "Aborted" });
            return rejectAborted();
          }

          let uploadData: GetUploadUrlResponse<TMeta>;

          try {
            uploadData = await getUploadUrl(job.file, jobIndex);
          } catch {
            if (isBatchStale() || isJobExplicitlyAborted()) {
              updateJob(job.id, { isUploading: false, error: "Aborted" });
              return rejectAborted();
            }

            const errMsg = "Failed to get upload URL";
            updateJob(job.id, { isUploading: false, error: errMsg });
            return { status: "rejected", file: job.file, error: errMsg };
          }

          if (isBatchStale() || isJobExplicitlyAborted()) {
            updateJob(job.id, { isUploading: false, error: "Aborted" });
            return rejectAborted();
          }

          if (!uploadData?.presignedUrl) {
            const errMsg = "Invalid presigned URL response";
            updateJob(job.id, { isUploading: false, error: errMsg });
            return { status: "rejected", file: job.file, error: errMsg };
          }

          const { presignedUrl, fields, meta } = uploadData;

          const result = await uploadFileXhr({
            file: job.file,
            presignedUrl,
            fields,
            timeout,
            retries,
            retryDelay,
            headers,
            signal,
            callbacks: {
              isStale: () => isBatchStale() || isJobExplicitlyAborted(),
              onXhrCreated: (xhr) => {
                xhrRefs.current.set(job.id, xhr);
              },
              onXhrDone: () => {
                xhrRefs.current.delete(job.id);
              },
              onProgress: (loaded, total) => {
                if (isBatchStale() || isJobExplicitlyAborted()) return;
                updateJob(job.id, {
                  loaded,
                  progress: total > 0 ? Math.round((loaded / total) * 100) : 0,
                });
              },
            },
          });

          if (isBatchStale() || isJobExplicitlyAborted()) {
            updateJob(job.id, { isUploading: false, error: "Aborted" });
            return rejectAborted();
          }

          if (result.ok) {
            updateJob(job.id, {
              isUploading: false,
              progress: 100,
              loaded: job.total,
              meta,
            });
            return { status: "fulfilled", file: job.file, meta };
          }

          if (result.code === "ABORTED") {
            updateJob(job.id, { isUploading: false, error: "Aborted" });
            return rejectAborted();
          }

          updateJob(job.id, { isUploading: false, error: result.message });
          return { status: "rejected", file: job.file, error: result.message };
        } finally {
          explicitlyAbortedJobIdsRef.current.delete(job.id);
        }
      };

      const results = [...earlyResults] as MultipleUploadResult<TMeta>[];

      if (normalizedConcurrency >= uploadableIndices.length) {
        const uploadResults = await Promise.all(
          uploadableIndices.map((i) => uploadSingleJob(i)),
        );

        uploadResults.forEach((result, idx) => {
          results[uploadableIndices[idx]] = result;
        });
      } else {
        let cursor = 0;

        const runNext = async (): Promise<void> => {
          while (cursor < uploadableIndices.length) {
            if (isBatchStale()) return;
            const idx = uploadableIndices[cursor++];
            results[idx] = await uploadSingleJob(idx);
          }
        };

        const workers = Array.from(
          { length: Math.min(normalizedConcurrency, uploadableIndices.length) },
          () => runNext(),
        );

        await Promise.all(workers);
      }

      if (isMountedRef.current && currentBatchId === batchIdRef.current) {
        setIsUploadingAll(false);
      }

      return results;
    },
    [
      maxFileSize,
      allowedTypes,
      timeout,
      retries,
      retryDelay,
      headers,
      signal,
      normalizedConcurrency,
      clearOnNewUpload,
      updateJob,
      abortTrackedXhrs,
    ],
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
