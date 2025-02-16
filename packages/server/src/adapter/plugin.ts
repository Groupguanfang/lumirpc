export interface Plugin {
  name: string
}

export interface NodeHttpBeforeHandleContext {
  use(middleware: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => unknown | Promise<unknown>): this
}

export interface NodeHttpAfterHandleContext extends NodeHttpBeforeHandleContext {}

export interface NodeHttpOnErrorContext extends NodeHttpBeforeHandleContext {}

export interface NodeHttpPlugin extends Plugin {
  beforeHandle?(ctx: NodeHttpBeforeHandleContext): Promise<unknown> | unknown
  afterHandle?(ctx: NodeHttpAfterHandleContext): Promise<unknown> | unknown
  onError?(ctx: NodeHttpOnErrorContext): Promise<unknown> | unknown
}

export interface NodeWebSocketPlugin extends Plugin {}

type InferParams<T> = T extends (...args: infer P) => unknown ? P : []
type InferReturn<T> = T extends (...args: any[]) => infer R ? R : unknown

export async function executePluginHook<TPlugin extends Plugin, TName extends keyof TPlugin>(plugins: TPlugin[], name: TName, params: InferParams<TPlugin[TName]>): Promise<InferReturn<TPlugin[TName]> | undefined> {
  let result: InferReturn<TPlugin[TName]> | undefined
  for (const plugin of plugins) {
    if (typeof plugin[name] !== 'function')
      continue

    result = await plugin[name](...params)
  }
  return result
}
