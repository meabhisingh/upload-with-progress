[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/useUpload.ts:23](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L23)

## Type Parameters

### TMeta

`TMeta`

## Properties

### abort()

> **abort**: () => `void`

Defined in: [src/browser/useUpload.ts:25](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L25)

#### Returns

`void`

***

### error

> **error**: `null` \| [`UploadError`](../classes/UploadError.md)

Defined in: [src/browser/useUpload.ts:30](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L30)

***

### isUploading

> **isUploading**: `boolean`

Defined in: [src/browser/useUpload.ts:28](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L28)

***

### progress

> **progress**: `number`

Defined in: [src/browser/useUpload.ts:27](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L27)

***

### reset()

> **reset**: () => `void`

Defined in: [src/browser/useUpload.ts:26](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L26)

#### Returns

`void`

***

### status

> **status**: [`UploadStatus`](../type-aliases/UploadStatus.md)

Defined in: [src/browser/useUpload.ts:29](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L29)

***

### upload()

> **upload**: (`file`, `getUploadUrl`) => `Promise`\<`TMeta`\>

Defined in: [src/browser/useUpload.ts:24](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/useUpload.ts#L24)

#### Parameters

##### file

`File`

##### getUploadUrl

[`GetUploadUrl`](../type-aliases/GetUploadUrl.md)\<`TMeta`\>

#### Returns

`Promise`\<`TMeta`\>
