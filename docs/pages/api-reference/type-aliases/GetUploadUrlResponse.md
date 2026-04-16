[**upload-with-progress**](../README.md)

***

> **GetUploadUrlResponse**\<`TMeta`\> = `object`

Defined in: [src/browser/types.ts:4](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L4)

Structure of the response expected from the backend `getUploadUrl` function.

## Type Parameters

### TMeta

`TMeta`

## Properties

### meta

> **meta**: `TMeta`

Defined in: [src/browser/types.ts:8](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L8)

Custom metadata returned from the backend

***

### presignedUrl

> **presignedUrl**: `string`

Defined in: [src/browser/types.ts:6](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/types.ts#L6)

The presigned URL used to perform the PUT request
