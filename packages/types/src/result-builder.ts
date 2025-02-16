import type { Result } from '.'
import { nanoid } from 'nanoid'

export function createResultBuilder(): ResultBuilder {
  return new ResultBuilder()
}

export class ResultBuilder {
  private id: Result['id'] = nanoid()
  private result: Result['result'] = undefined

  setId(id: Result['id']): this {
    this.id = id
    return this
  }

  getId(): Result['id'] {
    return this.id
  }

  setResult(result: Result['result']): this {
    this.result = result
    return this
  }

  getResult(): Result['result'] {
    return this.result
  }

  build(): Result {
    return {
      jsonrpc: '2.0',
      id: this.id,
      result: this.result,
    }
  }

  protected toJSON(): Result {
    return this.build()
  }
}
