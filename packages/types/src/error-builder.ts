import type { Error } from '.'
import { nanoid } from 'nanoid'

export function createErrorBuilder(): ErrorBuilder {
  return new ErrorBuilder()
}

export class ErrorBuilder {
  private id: Error['id'] = nanoid()
  private error: Error['error'] = {
    code: -32000,
    message: '',
    data: undefined,
  }

  setId(id: Error['id']): this {
    this.id = id
    return this
  }

  getId(): Error['id'] {
    return this.id
  }

  setErrorCode(code: Error['error']['code']): this {
    this.error.code = code
    return this
  }

  getErrorCode(): Error['error']['code'] {
    return this.error.code
  }

  setErrorMessage(message: Error['error']['message']): this {
    this.error.message = message
    return this
  }

  getErrorMessage(): Error['error']['message'] {
    return this.error.message
  }

  setErrorData(data: Error['error']['data']): this {
    this.error.data = data
    return this
  }

  getErrorData(): Error['error']['data'] {
    return this.error.data
  }

  build(): Error {
    return {
      jsonrpc: '2.0',
      id: this.id,
      error: this.error,
    }
  }

  protected toJSON(): Error {
    return this.build()
  }
}
