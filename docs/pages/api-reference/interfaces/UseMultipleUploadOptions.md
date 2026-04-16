[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/useMultipleUpload.ts:18](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L18)

Configuration options accepted by `useMultipleUpload`.

## Extends

- [`UploadCoreOptions`](UploadCoreOptions.md)

## Properties

### allowedTypes?

> `optional` **allowedTypes**: `string`[]

Defined in: src/browser/core.ts:54

Allowed MIME types (e.g. `["image/png", "image/jpeg"]`).
Supports wildcard subtypes such as `"image/*"`.

#### Default

```ts
undefined — all types allowed
```

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`allowedTypes`](UploadCoreOptions.md#allowedtypes)

***

### concurrency?

> `optional` **concurrency**: `number`

Defined in: [src/browser/useMultipleUpload.ts:24](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useMultipleUpload.ts#L24)

Maximum number of files uploaded concurrently.
For example, `concurrency: 3` uploads at most 3 files at a time.

#### Default

```ts
Infinity — all files start immediately
```

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: src/browser/core.ts:81

Extra headers to send with the PUT request.
`Content-Type` is set automatically from the file's MIME type
unless you provide an explicit `Content-Type` key here.

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`headers`](UploadCoreOptions.md#headers)

***

### maxFileSize?

> `optional` **maxFileSize**: `number`

Defined in: src/browser/core.ts:47

Maximum allowed file size **in bytes**.

#### Default

```ts
Infinity
```

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`maxFileSize`](UploadCoreOptions.md#maxfilesize)

***

### retries?

> `optional` **retries**: `number`

Defined in: src/browser/core.ts:67

Number of automatic retries on **transient failures**:
network errors, timeouts, HTTP 429, and HTTP 5xx.

#### Default

```ts
0
```

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`retries`](UploadCoreOptions.md#retries)

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: src/browser/core.ts:74

Base delay in ms for exponential back-off between retries.
Actual delay = `retryDelay × 2^attempt` (capped at 30 s).

#### Default

```ts
1000
```

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`retryDelay`](UploadCoreOptions.md#retrydelay)

***

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: src/browser/core.ts:88

An `AbortSignal` for external cancellation (e.g. from an `AbortController`,
React Query, or TanStack Query). When the signal fires, the in-flight XHR
is aborted immediately. Works alongside the hook's built-in `abort()` method.

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`signal`](UploadCoreOptions.md#signal)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: src/browser/core.ts:60

Upload timeout **in milliseconds**. Set to `0` to disable.

#### Default

```ts
0
```

#### Inherited from

[`UploadCoreOptions`](UploadCoreOptions.md).[`timeout`](UploadCoreOptions.md#timeout)
