import type { Awaitable, Id } from '@nano-rpc/types'

export interface Controller {
  [key: string]: (this: ControllerContext, ...args: any[]) => Promise<unknown>
}

export interface ControllerContext {
  send(data: unknown): Promise<void>
  id?: Id
  method: string
}

export class ControllerCollector {
  public static readonly container = new Map<string, () => Awaitable<Controller>>()
  public static readonly initializedContainer = new Map<string, Controller>()
}

export function defineController<TController extends Controller, TName extends string = string>(name: TName, controller: () => Awaitable<TController>): [TName, () => Awaitable<TController>] {
  ControllerCollector.container.set(name, controller)

  return [
    name,
    ControllerCollector.container.get(name) as () => Awaitable<TController>,
  ]
}
