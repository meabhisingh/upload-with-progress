[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/core.ts:42](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L42)

Core configuration shared by both `useUpload` and `useMultipleUpload`.
Each hook extends this with hook-specific options.

## Extended by

- [`UseUploadOptions`](UseUploadOptions.md)
- [`UseMultipleUploadOptions`](UseMultipleUploadOptions.md)

## Properties

### allowedTypes?

> `optional` **allowedTypes**: `string`[]

Defined in: [src/browser/core.ts:54](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L54)

Allowed MIME types (e.g. `["image/png", "image/jpeg"]`).
Supports wildcard subtypes such as `"image/*"`.

#### Default

```ts
undefined — all types allowed
```

***

### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Defined in: [src/browser/core.ts:81](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L81)

Extra headers to send with the PUT request.
`Content-Type` is set automatically from the file's MIME type
unless you provide an explicit `Content-Type` key here.

***

### maxFileSize?

> `optional` **maxFileSize**: `number`

Defined in: [src/browser/core.ts:47](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L47)

Maximum allowed file size **in bytes**.

#### Default

```ts
Infinity
```

***

### retries?

> `optional` **retries**: `number`

Defined in: [src/browser/core.ts:67](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L67)

Number of automatic retries on **transient failures**:
network errors, timeouts, HTTP 429, and HTTP 5xx.

#### Default

```ts
0
```

***

### retryDelay?

> `optional` **retryDelay**: `number`

Defined in: [src/browser/core.ts:74](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L74)

Base delay in ms for exponential back-off between retries.
Actual delay = `retryDelay × 2^attempt` (capped at 30 s).

#### Default

```ts
1000
```

***

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [src/browser/core.ts:88](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L88)

An `AbortSignal` for external cancellation (e.g. from an `AbortController`,
React Query, or TanStack Query). When the signal fires, the in-flight XHR
is aborted immediately. Works alongside the hook's built-in `abort()` method.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/browser/core.ts:60](https://github.com/meabhisingh/upload-with-progress/blob/666778dcd9a5898c68e1c1cb45b6c227095b9d11/src/browser/core.ts#L60)

Upload timeout **in milliseconds**. Set to `0` to disable.

#### Default

```ts
0
```
