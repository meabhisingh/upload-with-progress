[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/useMultipleUpload.ts:15](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L15)

## Type Parameters

### TMeta

`TMeta`

## Properties

### abort()

> **abort**: (`id`) => `void`

Defined in: [src/browser/useMultipleUpload.ts:23](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L23)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### abortAll()

> **abortAll**: () => `void`

Defined in: [src/browser/useMultipleUpload.ts:24](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L24)

#### Returns

`void`

***

### isUploadingAll

> **isUploadingAll**: `boolean`

Defined in: [src/browser/useMultipleUpload.ts:28](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L28)

***

### jobs

> **jobs**: [`UploadJob`](../type-aliases/UploadJob.md)\<`TMeta`\>[]

Defined in: [src/browser/useMultipleUpload.ts:26](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L26)

***

### overallProgress

> **overallProgress**: `number`

Defined in: [src/browser/useMultipleUpload.ts:27](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L27)

***

### reset()

> **reset**: () => `void`

Defined in: [src/browser/useMultipleUpload.ts:25](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L25)

#### Returns

`void`

***

### upload()

> **upload**: (`files`, `getUploadUrl`) => `Promise`\<[`MultipleUploadResult`](../type-aliases/MultipleUploadResult.md)\<`TMeta`\>[]\>

Defined in: [src/browser/useMultipleUpload.ts:16](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useMultipleUpload.ts#L16)

#### Parameters

##### files

`File`[]

##### getUploadUrl

(`file`, `index`) => `Promise`\<[`GetUploadUrlResponse`](../type-aliases/GetUploadUrlResponse.md)\<`TMeta`\>\>

#### Returns

`Promise`\<[`MultipleUploadResult`](../type-aliases/MultipleUploadResult.md)\<`TMeta`\>[]\>
