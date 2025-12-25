"use client";

import { useRef, useState } from "react";

/**
 * Structure of the response expected from the backend `getUploadUrl` function.
 */
export type GetUploadUrlResponse<TMeta> = {
  /** The presigned URL used to perform the PUT request */
  presignedUrl: string;
  /** Custom metadata returned from the backend */
  meta: TMeta;
};

/**
 * Function type that retrieves the upload URL and metadata.
 */
export type GetUploadUrl<TMeta = void> = () => Promise<
  GetUploadUrlResponse<TMeta>
>;

/**
 * React hook for uploading files with progress tracking.
 *
 * @template TMeta The type of metadata returned by the backend (optional).
 * @returns An object containing:
 * - `upload`: A function to initiate the file upload.
 * - `abort`: A function to cancel the ongoing upload.
 * - `progress`: The current upload progress percentage (0-100).
 * - `isUploading`: A boolean indicating if an upload is currently in progress.
 * - `error`: An error message string if the upload failed, or null.
 */
export function useUpload<TMeta = unknown>() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);

  /**
   * Uploads a file using a presigned URL.
   *
   * @param file - The file to upload.
   * @param getUploadUrl - Function that returns the presigned URL and metadata.
   * @returns A Promise that resolves to the metadata (`TMeta`) upon successful upload.
   * @throws Will throw an error if getting the URL fails or the upload request fails.
   */
  const upload = async (
    file: File,
    getUploadUrl: GetUploadUrl<TMeta>
  ): Promise<TMeta> => {
    setProgress(0);
    setError(null);
    setIsUploading(true);

    let uploadData: GetUploadUrlResponse<TMeta>;

    try {
      uploadData = await getUploadUrl();
    } catch (err) {
      setIsUploading(false);
      setError("Failed to get upload URL");
      throw err;
    }

    const { presignedUrl, meta } = uploadData;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open("PUT", presignedUrl, true);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(meta);
        } else {
          const message = xhr.statusText || "Upload failed";
          setError(message);
          reject(new Error(message));
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setError("Upload error");
        reject(new Error("Upload error"));
      };

      xhr.onabort = () => {
        setIsUploading(false);
        setProgress(0);
      };

      xhr.send(file);
    });
  };

  /**
   * Cancels the ongoing upload request immediately.
   */
  const abort = () => {
    xhrRef.current?.abort();
    xhrRef.current = null;
  };

  return {
    upload,
    abort,
    progress,
    isUploading,
    error,
  };
}
