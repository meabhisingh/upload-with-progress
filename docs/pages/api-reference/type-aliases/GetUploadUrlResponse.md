[**upload-with-progress**](../README.md)

***

> **GetUploadUrlResponse**\<`TMeta`\> = `object`

Defined in: [src/browser/types.ts:4](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L4)

Structure of the response expected from the backend `getUploadUrl` function.

## Type Parameters

### TMeta

`TMeta`

## Properties

### fields?

> `optional` **fields**: `Record`\<`string`, `string`\>

Defined in: [src/browser/types.ts:12](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L12)

Cryptographic fields required by AWS for secure POST uploads.
If omitted, the engine will safely fall back to a standard PUT request.

***

### meta

> **meta**: `TMeta`

Defined in: [src/browser/types.ts:15](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L15)

Custom metadata returned from the backend

***

### presignedUrl

> **presignedUrl**: `string`

Defined in: [src/browser/types.ts:6](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/types.ts#L6)

The presigned URL used to perform the PUT request
