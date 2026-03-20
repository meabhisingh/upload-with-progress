import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type {
  GetUploadUrlResponse,
  MultipleUploadResult,
  UploadJob,
} from "./types";

export function useMultipleUpload<TMeta = unknown>() {
  const [jobs, setJobs] = useState<UploadJob<TMeta>[]>([]);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const xhrRefs = useRef<Map<string, XMLHttpRequest>>(new Map());

  useEffect(() => {
    return () => {
      xhrRefs.current.forEach((xhr) => xhr.abort());
      xhrRefs.current.clear();
    };
  }, []);

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

  const upload = useCallback(
    async (
      files: File[],
      getUploadUrl: (
        file: File,
        index: number,
      ) => Promise<GetUploadUrlResponse<TMeta>>,
    ): Promise<MultipleUploadResult<TMeta>[]> => {
      const newJobs: UploadJob<TMeta>[] = files.map((file, index) => ({
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${file.name}-${Date.now()}-${index}`,
        file,
        progress: 0,
        loaded: 0,
        total: file.size,
        isUploading: true,
        error: null,
      }));

      setJobs((prev) => [...prev, ...newJobs]);
      setIsUploadingAll(true);

      // We handle the async URL fetch *outside* the XHR Promise.
      const uploadPromises = newJobs.map(
        async (job, index): Promise<MultipleUploadResult<TMeta>> => {
          let uploadData: GetUploadUrlResponse<TMeta>;

          try {
            uploadData = await getUploadUrl(job.file, index);
          } catch (err) {
            setJobs((prev) =>
              prev.map((p) =>
                p.id === job.id
                  ? {
                      ...p,
                      isUploading: false,
                      error: "Failed to get upload URL",
                    }
                  : p,
              ),
            );
            return {
              status: "rejected",
              file: job.file,
              error: "Failed to get upload URL",
            };
          }

          const { presignedUrl, meta } = uploadData;

          // Now we wrap just the XHR in a Promise
          return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhrRefs.current.set(job.id, xhr);

            xhr.open("PUT", presignedUrl, true);
            xhr.setRequestHeader(
              "Content-Type",
              job.file.type || "application/octet-stream",
            );

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setJobs((prev) =>
                  prev.map((p) =>
                    p.id === job.id
                      ? {
                          ...p,
                          loaded: e.loaded,
                          progress: Math.round((e.loaded / e.total) * 100),
                        }
                      : p,
                  ),
                );
              }
            };

            xhr.onload = () => {
              xhrRefs.current.delete(job.id);
              if (xhr.status >= 200 && xhr.status < 300) {
                setJobs((prev) =>
                  prev.map((p) =>
                    p.id === job.id
                      ? {
                          ...p,
                          isUploading: false,
                          progress: 100,
                          loaded: job.total,
                          meta,
                        }
                      : p,
                  ),
                );
                resolve({ status: "fulfilled", file: job.file, meta });
              } else {
                const message = xhr.statusText || "Upload failed";
                setJobs((prev) =>
                  prev.map((p) =>
                    p.id === job.id
                      ? { ...p, isUploading: false, error: message }
                      : p,
                  ),
                );
                resolve({ status: "rejected", file: job.file, error: message });
              }
            };

            xhr.onerror = () => {
              xhrRefs.current.delete(job.id);
              setJobs((prev) =>
                prev.map((p) =>
                  p.id === job.id
                    ? { ...p, isUploading: false, error: "Network error" }
                    : p,
                ),
              );
              resolve({
                status: "rejected",
                file: job.file,
                error: "Network error",
              });
            };

            xhr.onabort = () => {
              xhrRefs.current.delete(job.id);
              setJobs((prev) =>
                prev.map((p) =>
                  p.id === job.id
                    ? { ...p, isUploading: false, error: "Aborted" }
                    : p,
                ),
              );
              resolve({ status: "rejected", file: job.file, error: "Aborted" });
            };

            xhr.send(job.file);
          });
        },
      );

      const results = await Promise.all(uploadPromises);

      // Only set isUploadingAll to false if there are no more active XHRs
      if (xhrRefs.current.size === 0) {
        setIsUploadingAll(false);
      }

      return results;
    },
    [],
  );

  return { upload, abort, abortAll, jobs, overallProgress, isUploadingAll };
}
