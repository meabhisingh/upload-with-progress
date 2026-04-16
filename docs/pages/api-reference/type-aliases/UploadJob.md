[**upload-with-progress**](../README.md)

***

> **UploadJob**\<`TMeta`\> = `object`

Defined in: [src/browser/types.ts:21](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L21)

Represents the state of a single file being uploaded in a batch.

## Type Parameters

### TMeta

`TMeta`

## Properties

### error

> **error**: `string` \| `null`

Defined in: [src/browser/types.ts:35](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L35)

Error message if this specific upload failed

***

### file

> **file**: `File`

Defined in: [src/browser/types.ts:25](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L25)

The file being uploaded

***

### id

> **id**: `string`

Defined in: [src/browser/types.ts:23](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L23)

Unique identifier for the upload job

***

### isUploading

> **isUploading**: `boolean`

Defined in: [src/browser/types.ts:33](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L33)

True if the file is currently uploading

***

### loaded

> **loaded**: `number`

Defined in: [src/browser/types.ts:29](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L29)

Bytes successfully loaded

***

### meta?

> `optional` **meta**: `TMeta`

Defined in: [src/browser/types.ts:37](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L37)

The metadata returned upon successful upload

***

### progress

> **progress**: `number`

Defined in: [src/browser/types.ts:27](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L27)

Individual progress percentage (0-100)

***

### total

> **total**: `number`

Defined in: [src/browser/types.ts:31](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L31)

Total bytes of the file
