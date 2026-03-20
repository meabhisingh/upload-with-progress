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
export type GetUploadUrl<TMeta = void> = (
  file: File,
) => Promise<GetUploadUrlResponse<TMeta>>;

/**
 * Represents the state of a single file being uploaded in a batch.
 */
export type UploadJob<TMeta> = {
  /** Unique identifier for the upload job */
  id: string;
  /** The file being uploaded */
  file: File;
  /** Individual progress percentage (0-100) */
  progress: number;
  /** Bytes successfully loaded */
  loaded: number;
  /** Total bytes of the file */
  total: number;
  /** True if the file is currently uploading */
  isUploading: boolean;
  /** Error message if this specific upload failed */
  error: string | null;
  /** The metadata returned upon successful upload */
  meta?: TMeta;
};

export type MultipleUploadResult<TMeta> = {
  status: "fulfilled" | "rejected";
  file: File;
  meta?: TMeta;
  error?: string;
};
