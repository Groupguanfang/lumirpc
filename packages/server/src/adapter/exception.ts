import { createErrorBuilder, type Error as RpcError } from '@nanorpc/types'
import { nanoid } from 'nanoid'
import { typeAssert } from '../utils'

export class RpcException<TData = unknown> extends Error {
  constructor(
    public readonly message: string,
    public readonly code: number = -32000,
    public readonly data?: TData,
    public readonly id = nanoid(),
  ) {
    super(message)
  }

  public readonly jsonrpc = '2.0'

  public get error(): RpcError['error'] {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    }
  }

  toJSON(): RpcError {
    return {
      jsonrpc: this.jsonrpc,
      id: this.id,
      error: this.error,
    }
  }

  static from(error: string): RpcError<undefined>
  static from(error: number): RpcError<undefined>
  static from<TException extends Partial<RpcException>>(error: TException): RpcError<TException['data']>
  static from(error: unknown): RpcError
  static from(error: unknown): RpcError {
    if (error instanceof RpcException)
      return error.toJSON()

    if (!error) {
      return createErrorBuilder()
        .setErrorMessage('Internal server error')
        .setErrorCode(-32000)
        .build()
    }

    switch (typeof error) {
      case 'string':
        return createErrorBuilder()
          .setErrorMessage(error)
          .setErrorCode(-32000)
          .build()
      case 'object':
        typeAssert<Partial<RpcException>>(error)
        return createErrorBuilder()
          .setErrorMessage(error.message || 'Internal server error')
          .setErrorCode(error.code || -32000)
          .setErrorData(error.data || undefined)
          .build()
      case 'number':
        return createErrorBuilder()
          .setErrorCode(error)
          .setErrorMessage('Internal server error')
          .build()
      default:
        return createErrorBuilder()
          .setErrorMessage('Internal server error')
          .setErrorCode(-32000)
          .build()
    }
  }
}
