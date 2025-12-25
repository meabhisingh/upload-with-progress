[**upload-with-progress**](../README.md)

***

> **useUpload**\<`TMeta`\>(): `object`

Defined in: useUpload.ts:33

React hook for uploading files with progress tracking.

## Type Parameters

### TMeta

`TMeta` = `unknown`

The type of metadata returned by the backend (optional).

## Returns

An object containing:
- `upload`: A function to initiate the file upload.
- `abort`: A function to cancel the ongoing upload.
- `progress`: The current upload progress percentage (0-100).
- `isUploading`: A boolean indicating if an upload is currently in progress.
- `error`: An error message string if the upload failed, or null.

### abort()

> **abort**: () => `void`

Cancels the ongoing upload request immediately.

#### Returns

`void`

### error

> **error**: `null` \| `string`

### isUploading

> **isUploading**: `boolean`

### progress

> **progress**: `number`

### upload()

> **upload**: (`file`, `getUploadUrl`) => `Promise`\<`TMeta`\>

Uploads a file using a presigned URL.

#### Parameters

##### file

`File`

The file to upload.

##### getUploadUrl

[`GetUploadUrl`](../type-aliases/GetUploadUrl.md)\<`TMeta`\>

Function that returns the presigned URL and metadata.

#### Returns

`Promise`\<`TMeta`\>

A Promise that resolves to the metadata (`TMeta`) upon successful upload.

#### Throws

Will throw an error if getting the URL fails or the upload request fails.
