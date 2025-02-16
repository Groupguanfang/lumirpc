import type { Id } from '@nanorpc/types'

export interface Controller {
  [key: string]: (this: ControllerContext, ...args: any[]) => Promise<unknown>
}

export interface ControllerContext {
  send(data: unknown): Promise<void>
  id?: Id
  method: string
}

export class ControllerCollector {
  public static readonly container = new Map<string, Controller>()
}

export function defineController<TName extends string, TController extends Controller>(name: TName, controller: TController): [TName, TController] {
  ControllerCollector.container.set(name, controller)
  return [
    name,
    ControllerCollector.container.get(name) as TController,
  ]
}
