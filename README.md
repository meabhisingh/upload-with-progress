# upload-with-progress

A lightweight, robust React hook for handling file uploads using presigned URLs with built-in progress tracking, cancellation, and metadata support. Use this generic package for uploading files to S3, Cloudflare R2, Google Cloud Storage, or any other compatible storage provider effortlessly.

[![npm version](https://img.shields.io/npm/v/upload-with-progress.svg)](https://www.npmjs.com/package/upload-with-progress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📚 Documentation

For full documentation, detailed API references, and advanced usage, visit:
**[https://upload-with-progress.pages.dev](https://upload-with-progress.pages.dev)**

---

## ✨ Features

- **🚀 Zero Dependencies to Start**: Simple and lightweight.
- **📊 Real-time Progress**: Built-in upload progress state (0-100%).
- **🛑 Cancellable**: Abort uploads easily with a single function call.
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

## 🚀 Quick Start

Here's a simple example of how to use the `useUpload` hook in your component.

```tsx
import React from "react";
import { useUpload } from "upload-with-progress";

function FileUploader() {
  const { upload, progress, isUploading, error, abort } = useUpload();

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
      console.error("Upload failed:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />

      {isUploading && (
        <div className="progress-bar">
          <p>Uploading... {progress}%</p>
          <progress value={progress} max="100" />
          <button onClick={abort}>Cancel</button>
        </div>
      )}

      {error && <p className="error">Error: {error}</p>}
    </div>
  );
}
```

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
