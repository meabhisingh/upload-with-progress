[**upload-with-progress**](../README.md)

***

> **useUpload**\<`TMeta`\>(`options`): [`UseUploadReturn`](../interfaces/UseUploadReturn.md)\<`TMeta`\>

Defined in: [src/browser/useUpload.ts:86](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L86)

React hook for uploading a single file to a presigned URL with
real-time progress tracking, automatic retries, timeouts, and
file validation.

## Type Parameters

### TMeta

`TMeta` = `unknown`

The shape of the metadata your backend returns.

## Parameters

### options

[`UseUploadOptions`](../interfaces/UseUploadOptions.md) = `{}`

## Returns

[`UseUploadReturn`](../interfaces/UseUploadReturn.md)\<`TMeta`\>

## Example

```tsx
const { upload, progress, isUploading, status, error, abort, reset } =
  useUpload<{ key: string }>({
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedTypes: ["image/*"],
    timeout: 60_000,
    retries: 2,
  });

const handleUpload = async (file: File) => {
  try {
    const meta = await upload(file, async (f) => {
      const res = await fetch(`/api/presign?name=${f.name}`);
      return res.json();
    });
    console.log("Uploaded:", meta.key);
  } catch (err) {
    if (err instanceof UploadError && err.code === "ABORTED") return;
    console.error(err);
  }
};
```
