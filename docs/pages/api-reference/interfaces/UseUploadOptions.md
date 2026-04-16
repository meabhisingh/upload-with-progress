[**upload-with-progress**](../README.md)

***

Defined in: [src/browser/useUpload.ts:25](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L25)

Configuration options accepted by `useUpload`.

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

### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [src/browser/useUpload.ts:31](https://github.com/meabhisingh/upload-with-progress/blob/cfd27c6a23f87ccab17062f33a00c0a8eecd994e/src/browser/useUpload.ts#L31)

Optional callback fired on every progress event.
Useful when you need to feed progress into external stores (Zustand, etc.)
without triggering a React re-render.

#### Parameters

##### progress

`number`

#### Returns

`void`

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
