[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/useMultipleUpload.ts:27](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L27)

## Type Parameters

### TMeta

`TMeta`

## Properties

### abort()

> **abort**: (`id`) => `void`

Defined in: [src/browser/useMultipleUpload.ts:37](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L37)

Cancel a single upload by job ID.

#### Parameters

##### id

`string`

#### Returns

`void`

***

### abortAll()

> **abortAll**: () => `void`

Defined in: [src/browser/useMultipleUpload.ts:39](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L39)

Cancel all in-flight uploads.

#### Returns

`void`

***

### isUploadingAll

> **isUploadingAll**: `boolean`

Defined in: [src/browser/useMultipleUpload.ts:47](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L47)

Whether any upload is currently in flight.

***

### jobs

> **jobs**: [`UploadJob`](../type-aliases/UploadJob.md)\<`TMeta`\>[]

Defined in: [src/browser/useMultipleUpload.ts:43](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L43)

Per-file job states.

***

### overallProgress

> **overallProgress**: `number`

Defined in: [src/browser/useMultipleUpload.ts:45](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L45)

Weighted overall progress (0 – 100).

***

### reset()

> **reset**: () => `void`

Defined in: [src/browser/useMultipleUpload.ts:41](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L41)

Reset the hook to its initial idle state, aborting all uploads.

#### Returns

`void`

***

### upload()

> **upload**: (`files`, `getUploadUrl`) => `Promise`\<[`MultipleUploadResult`](../type-aliases/MultipleUploadResult.md)\<`TMeta`\>[]\>

Defined in: [src/browser/useMultipleUpload.ts:29](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L29)

Initiate a batch upload.

#### Parameters

##### files

`File`[]

##### getUploadUrl

(`file`, `index`) => `Promise`\<[`GetUploadUrlResponse`](../type-aliases/GetUploadUrlResponse.md)\<`TMeta`\>\>

#### Returns

`Promise`\<[`MultipleUploadResult`](../type-aliases/MultipleUploadResult.md)\<`TMeta`\>[]\>
