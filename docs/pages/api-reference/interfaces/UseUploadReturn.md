[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/useUpload.ts:34](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L34)

## Type Parameters

### TMeta

`TMeta`

## Properties

### abort()

> **abort**: () => `void`

Defined in: [src/browser/useUpload.ts:38](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L38)

Cancel the in-flight upload.

#### Returns

`void`

***

### error

> **error**: `null` \| [`UploadError`](../classes/UploadError.md)

Defined in: [src/browser/useUpload.ts:48](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L48)

The last `UploadError`, or `null`.

***

### isUploading

> **isUploading**: `boolean`

Defined in: [src/browser/useUpload.ts:44](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L44)

Whether an upload is currently in flight.

***

### progress

> **progress**: `number`

Defined in: [src/browser/useUpload.ts:42](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L42)

Upload progress percentage (0 – 100).

***

### reset()

> **reset**: () => `void`

Defined in: [src/browser/useUpload.ts:40](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L40)

Reset the hook to its initial idle state.

#### Returns

`void`

***

### status

> **status**: [`UploadStatus`](../type-aliases/UploadStatus.md)

Defined in: [src/browser/useUpload.ts:46](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L46)

Lifecycle status: `idle` → `uploading` → `success` | `error`.

***

### upload()

> **upload**: (`file`, `getUploadUrl`) => `Promise`\<`TMeta`\>

Defined in: [src/browser/useUpload.ts:36](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L36)

Initiate a file upload.

#### Parameters

##### file

`File`

##### getUploadUrl

[`GetUploadUrl`](../type-aliases/GetUploadUrl.md)\<`TMeta`\>

#### Returns

`Promise`\<`TMeta`\>
