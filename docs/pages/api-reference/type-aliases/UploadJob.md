[**upload-with-progress**](../README.md)

***

> **UploadJob**\<`TMeta`\> = `object`

Defined in: [src/browser/types.ts:28](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L28)

Represents the state of a single file being uploaded in a batch.

## Type Parameters

### TMeta

`TMeta`

## Properties

### error

> **error**: `string` \| `null`

Defined in: [src/browser/types.ts:42](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L42)

Error message if this specific upload failed

***

### file

> **file**: `File`

Defined in: [src/browser/types.ts:32](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L32)

The file being uploaded

***

### id

> **id**: `string`

Defined in: [src/browser/types.ts:30](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L30)

Unique identifier for the upload job

***

### isUploading

> **isUploading**: `boolean`

Defined in: [src/browser/types.ts:40](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L40)

True if the file is currently uploading

***

### loaded

> **loaded**: `number`

Defined in: [src/browser/types.ts:36](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L36)

Bytes successfully loaded

***

### meta?

> `optional` **meta**: `TMeta`

Defined in: [src/browser/types.ts:44](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L44)

The metadata returned upon successful upload

***

### progress

> **progress**: `number`

Defined in: [src/browser/types.ts:34](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L34)

Individual progress percentage (0-100)

***

### total

> **total**: `number`

Defined in: [src/browser/types.ts:38](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L38)

Total bytes of the file
