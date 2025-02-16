import type { Payload } from '.'
import { nanoid } from 'nanoid'

export class ArrayParamPayloadBuilder {
  private method: Payload['method'] = ''
  private params: Payload['params'] = []
  private id: Payload['id'] = nanoid()

  setMethod(method: Payload['method']): this {
    this.method = method
    return this
  }

  getMethod(): Payload['method'] {
    return this.method
  }

  setParams(params: unknown[]): this {
    this.params = params
    return this
  }

  getParams(): unknown[] {
    return this.params as unknown[]
  }

  setId(id: Payload['id']): this {
    this.id = id
    return this
  }

  getId(): Payload['id'] {
    return this.id
  }

  build(): Payload {
    return {
      jsonrpc: '2.0',
      method: this.method,
      params: this.params,
      id: this.id,
    }
  }

  protected toJSON(): Payload {
    return this.build()
  }
}

export class ObjectParamPayloadBuilder {
  private method: Payload['method'] = ''
  private params: Payload['params'] = {}
  private id: Payload['id'] = nanoid()

  setMethod(method: Payload['method']): this {
    this.method = method
    return this
  }

  getMethod(): Payload['method'] {
    return this.method
  }

  setParams(params: Record<string, unknown>): this {
    this.params = params
    return this
  }

  getParams(): Record<string, unknown> {
    return this.params as Record<string, unknown>
  }

  setId(id: Payload['id']): this {
    this.id = id
    return this
  }

  getId(): Payload['id'] {
    return this.id
  }

  build(): Payload {
    return {
      jsonrpc: '2.0',
      method: this.method,
      params: this.params,
      id: this.id,
    }
  }

  protected toJSON(): Payload {
    return this.build()
  }
}

export function createBuilder(builderType: 'array-param'): ArrayParamPayloadBuilder
export function createBuilder(builderType: 'object-param'): ObjectParamPayloadBuilder
export function createBuilder(builderType: 'array-param' | 'object-param'): ArrayParamPayloadBuilder | ObjectParamPayloadBuilder {
  switch (builderType) {
    case 'array-param':
      return new ArrayParamPayloadBuilder()
    case 'object-param':
      return new ObjectParamPayloadBuilder()
    default:
      throw new Error(`Invalid builder type: ${builderType}`)
  }
}
