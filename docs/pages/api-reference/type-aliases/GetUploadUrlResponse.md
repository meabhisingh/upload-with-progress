[**upload-with-progress**](../README.md)

***

> **GetUploadUrlResponse**\<`TMeta`\> = `object`

Defined in: useUpload.ts:8

Structure of the response expected from the backend `getUploadUrl` function.

## Type Parameters

### TMeta

`TMeta`

## Properties

### meta

> **meta**: `TMeta`

Defined in: useUpload.ts:12

Custom metadata returned from the backend

***

### presignedUrl

> **presignedUrl**: `string`

Defined in: useUpload.ts:10

The presigned URL used to perform the PUT request
