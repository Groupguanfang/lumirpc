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
