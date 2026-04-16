[**upload-with-progress**](../README.md)

***

> **useMultipleUpload**\<`TMeta`\>(`options`): [`UseMultipleUploadReturn`](../interfaces/UseMultipleUploadReturn.md)\<`TMeta`\>

Defined in: [src/browser/useMultipleUpload.ts:81](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L81)

React hook for uploading **multiple files** with per-file progress,
automatic retries, timeouts, concurrency control, and file validation.

## Type Parameters

### TMeta

`TMeta` = `unknown`

The shape of the metadata your backend returns per file.

## Parameters

### options

[`UseMultipleUploadOptions`](../interfaces/UseMultipleUploadOptions.md) = `{}`

## Returns

[`UseMultipleUploadReturn`](../interfaces/UseMultipleUploadReturn.md)\<`TMeta`\>

## Example

```tsx
const { upload, jobs, overallProgress, abortAll, reset } =
  useMultipleUpload<{ key: string }>({
    maxFileSize: 50 * 1024 * 1024,
    allowedTypes: ["image/*", "video/*"],
    timeout: 120_000,
    retries: 2,
    concurrency: 3,
  });

const handleUpload = async (files: File[]) => {
  const results = await upload(files, async (file, index) => {
    const res = await fetch(`/api/presign?name=${file.name}`);
    return res.json();
  });
  const succeeded = results.filter(r => r.status === "fulfilled");
  console.log(`${succeeded.length}/${results.length} uploaded`);
};
```
