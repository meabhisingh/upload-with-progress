**upload-with-progress**

***

# upload-with-progress

A lightweight, production-ready React hook library for handling file uploads using presigned URLs. Features built-in progress tracking, retry logic with exponential backoff, concurrency control, file validation, and metadata support. Use this generic package for uploading files to AWS S3, Cloudflare R2, Google Cloud Storage, or any other compatible storage provider effortlessly.

[![npm version](https://img.shields.io/npm/v/upload-with-progress.svg)](https://www.npmjs.com/package/upload-with-progress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📚 Documentation

For full documentation, detailed API references, and advanced usage, visit:
**[https://upload-with-progress.pages.dev](https://upload-with-progress.pages.dev)**

---

## ✨ Features

- **🚀 Two Hooks**: `useUpload` for single files, `useMultipleUpload` for batch uploads.
- **🛡️ Production Ready**: Automatic retries with exponential backoff for transient failures (429, 5xx) and timeouts.
- **📊 Real-time Progress**: Built-in upload progress state (0-100%) per file and overall batch progress.
- **🚦 Concurrency Control**: Limit simultaneous uploads in batch processing.
- **🛑 Cancellable**: Abort uploads easily via function call or external `AbortSignal`.
- **✅ File Validation**: Built-in `maxFileSize` and `allowedTypes` MIME validation.
- **🔒 Secure**: Works perfectly with presigned URLs (S3, R2, GCS, MinIO).
- **📝 TypeScript Ready**: Fully typed with generics for typed metadata.
- **🧩 Headless**: You control the UI, we handle the logic.

## 📦 Installation

```bash
npm install upload-with-progress
# or
yarn add upload-with-progress
# or
pnpm add upload-with-progress
# or
bun add upload-with-progress
```

## 🚀 Quick Start: Single File Upload

Here's a simple example of how to use the `useUpload` hook in your component.

```tsx
import React from "react";
import { useUpload, UploadError } from "upload-with-progress";

function FileUploader() {
  const { upload, progress, status, error, abort } = useUpload({
    maxFileSize: 10 * 1024 * 1024, // 10 MB limit
    allowedTypes: ["image/*"],
    retries: 2, // Automatically retry 2 times on network failures
    retryDelay: 1000, // Starts with 1s backoff
    timeout: 60000, // Abort request after 60s
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // The `upload` function returns the metadata from your backend
      const uploadedMeta = await upload(file, async () => {
        // Fetch the presigned URL from your API
        const response = await fetch("/api/get-presigned-url", {
          method: "POST",
          body: JSON.stringify({ name: file.name, type: file.type }),
        });
        
        // Expected response format: { presignedUrl: string, meta: any }
        return response.json();
      });

      console.log("Upload successful!", uploadedMeta);
    } catch (err) {
      if (err instanceof UploadError) {
        if (err.code === "ABORTED") console.log("User cancelled");
        else console.error(`Upload error: ${err.message}`);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />

      {status === "uploading" && (
        <div className="progress-bar">
          <p>Uploading... {progress}%</p>
          <progress value={progress} max="100" />
          <button onClick={abort}>Cancel</button>
        </div>
      )}

      {status === "error" && error && <p className="error">Error: {error.message}</p>}
    </div>
  );
}
```

## 📚 Batch Processing: Multiple File Uploads

Upload multiple files simultaneously with concurrency limits using `useMultipleUpload`.

```tsx
import React from "react";
import { useMultipleUpload } from "upload-with-progress";

function MultiFileUploader() {
  const { upload, jobs, overallProgress, isUploadingAll, abortAll } = useMultipleUpload({
    maxFileSize: 50 * 1024 * 1024, // 50MB per file
    allowedTypes: ["image/*", "video/*"],
    concurrency: 3, // Upload max 3 files at a time
    retries: 3,
  });

  const handleFiles = async (files: File[]) => {
    const results = await upload(files, async (file, index) => {
      const res = await fetch(`/api/presign?name=${file.name}`);
      return res.json();
    });
    
    const succeeded = results.filter((r) => r.status === "fulfilled");
    console.log(`${succeeded.length}/${results.length} files uploaded successfully.`);
  };

  return (
    <div>
      {/* Example: Pass files to handleFiles somehow */}
      <button onClick={() => {/* ... */}}>Upload Files</button>
      
      {isUploadingAll && (
        <div>
          <h4>Overall Progress: {overallProgress}%</h4>
          <button onClick={abortAll}>Cancel All</button>
        </div>
      )}

      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            {job.file.name} - 
            {job.isUploading ? `${job.progress}%` : job.error ? `Failed: ${job.error}` : "Done"}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## ⚙️ Configuration Options

Both hooks accept an `options` object with the following configuration:

| Option | Type | Default | Description |
|---|---|---|---|
| `maxFileSize` | `number` | `Infinity` | Max file size in bytes. Rejects file upfront if it exceeds this. |
| `allowedTypes` | `string[]` | `undefined` | Allowed MIME types (e.g. `["image/png"]`, `["image/*"]`). |
| `timeout` | `number` | `0` | Per-upload timeout in milliseconds. |
| `retries` | `number` | `0` | Auto-retries for transient failures (Network, Timeouts, HTTP 429/5xx). |
| `retryDelay` | `number` | `1000` | Base delay for exponential backoff in milliseconds. |
| `headers` | `Record<string, string>` | `undefined` | Custom HTTP headers sent during the PUT request. |
| `signal` | `AbortSignal` | `undefined` | Native `AbortSignal` for external cancellation (e.g. via AbortController or React Query). |
| `onProgress` | `Function` | `undefined` | **(useUpload only)** Hook to pipe progress efficiently to external stores. |
| `concurrency` | `number` | `Infinity` | **(useMultipleUpload only)** Max parallel uploads simultaneously. |

## 🔌 API Contract

Your backend endpoint (passed to `getUploadUrl`) needs to return a JSON object with the following structure:

```ts
{
  "presignedUrl": "https://bucket.s3.region.amazonaws.com/...", // Required: The PUT URL
  "meta": { ... } // Optional: Any metadata you want to return to the frontend
}
```

## 📄 License

MIT © [Abhishek Singh](https://github.com/meabhisingh)
