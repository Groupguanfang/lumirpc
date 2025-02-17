export type Id = string | number

export interface Result<TResult = unknown> {
  jsonrpc: '2.0'
  id: Id
  result: TResult
}

export interface ErrorSpec<TErrorData = unknown> {
  code: number
  message: string
  data?: TErrorData
}

export interface Error<TErrorData = unknown> {
  jsonrpc: '2.0'
  id: Id
  error: ErrorSpec<TErrorData>
}

export interface Payload {
  jsonrpc: '2.0'
  method: string
  params: unknown[] | Record<string, unknown>
  id?: Id
}

export * from './error-builder'
export * from './payload-builder'
export * from './result-builder'

export function isError(data: unknown): data is Error {
  if (typeof data !== 'object' || data === null)
    return false

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  if (data.jsonrpc !== '2.0' || typeof data.error !== 'object' || data.error === null || typeof data.error.code !== 'number' || typeof data.error.message !== 'string')
    return false

  return true
}

export function isResult(data: unknown): data is Result {
  if (typeof data !== 'object' || data === null)
    return false

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  if (data.jsonrpc !== '2.0' || typeof data.result !== 'undefined' || typeof data.error !== 'undefined')
    return false

  return true
}

export function typeAssert<T>(data: unknown): asserts data is T {}
export type Awaitable<T> = T | Promise<T>
