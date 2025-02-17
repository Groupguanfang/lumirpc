import type { Awaitable, Result } from '@nano-rpc/types'
import type { NodeHttpServer, NodeWebSocketServer } from '../node'
import type { Adapter, Handler, InferPromise } from './adapter'
import type { Controller } from './collector'
import type { Plugin } from './plugin'
import { createErrorBuilder, createResultBuilder } from '@nano-rpc/types'
import { get } from 'lodash-es'
import { nanoid } from 'nanoid'
import { createNodeHttpAdapter, createNodeWebSocketAdapter } from '../node'
import { ControllerCollector } from './collector'
import { executePluginHook } from './plugin'

export interface RpcServer {
  listen(port: number): Promise<unknown>
  close(): Promise<void>
  setup(handler: Handler): Promise<void>
  use(plugin: Awaitable<Plugin>): this
  getPlugins(): Awaitable<Plugin>[]
}

export interface RpcServerApp {
  getAppHandler(): Handler
}

export type RpcApp<TAdapterServer extends RpcServer = RpcServer> = TAdapterServer & RpcServerApp

export enum InternalAdapter {
  /**
   * Use Node.js HTTP server.
   */
  NodeHttp,
  /**
   * Use Node.js WebSocket server.
   */
  NodeWebSocket,
}

/**
 * Create a new RPC server.
 *
 * @param adapter - The adapter to use.
 */
export async function createRpcServer<TAdapter extends Adapter = Adapter>(adapter: TAdapter): Promise<RpcApp<InferPromise<ReturnType<TAdapter>>>>
/**
 * Create a new RPC server using the Node.js HTTP adapter.
 *
 * @param adapter
 */
export async function createRpcServer(adapter: InternalAdapter.NodeHttp): Promise<RpcApp<NodeHttpServer>>
/**
 * Create a new RPC server using the Node.js WebSocket adapter.
 *
 * @param adapter
 */
export async function createRpcServer(adapter: InternalAdapter.NodeWebSocket): Promise<RpcApp<NodeWebSocketServer>>
export async function createRpcServer<TAdapter extends Adapter = Adapter>(adapter: TAdapter | InternalAdapter): Promise<RpcApp<InferPromise<ReturnType<TAdapter>>>> {
  const adapterServer = await createAdapterServer(adapter)
  const handler = createHandler()

  return {
    ...adapterServer,
    async listen(port) {
      await executePluginHook(adapterServer.getPlugins(), 'install', [])
      const listener = await adapterServer.listen(port)
      await adapterServer.setup(handler)
      return listener
    },
    getAppHandler: () => handler,
  } as RpcApp<InferPromise<ReturnType<TAdapter>>>
}

async function createAdapterServer(adapter: InternalAdapter | Adapter): Promise<InferPromise<ReturnType<Adapter>>> {
  switch (adapter) {
    case InternalAdapter.NodeHttp:
      return await createNodeHttpAdapter()()
    case InternalAdapter.NodeWebSocket:
      return await createNodeWebSocketAdapter()()
    default:
      return await adapter()
  }
}

async function getSingletonController(name: string): Promise<Controller | undefined> {
  const controller = ControllerCollector.initializedContainer.get(name)
  if (!controller) {
    const noInitializedController = ControllerCollector.container.get(name)
    if (!noInitializedController)
      return undefined
    const initializedController = await noInitializedController()
    ControllerCollector.initializedContainer.set(name, initializedController)
    return initializedController
  }
  return controller
}

export function createHandler(): Handler {
  return async (ctx) => {
    const [controllerName, ...methodNameArray] = ctx.method.split('.')
    const controller = await getSingletonController(controllerName)
    if (!controller)
      return createErrorBuilder().setErrorCode(-32601).setErrorMessage('Method not found').build()
    const method = get(controller, methodNameArray.join('.'))
    if (!method)
      return createErrorBuilder().setErrorCode(-32601).setErrorMessage('Method not found').build()
    if (typeof method !== 'function')
      return createErrorBuilder().setErrorCode(-32601).setErrorMessage('Method not found').build()

    const result = await method.call({
      send: ctx.send,
      id: ctx.id,
      method: ctx.method,
    }, ...Array.isArray(ctx.params) ? ctx.params || [] : Object.values(ctx.params || {}))
    if (typeof result === 'object' && result !== null && 'jsonrpc' in result && result.jsonrpc === '2.0')
      return result as Result
    return createResultBuilder().setResult(result).setId(ctx.id || nanoid()).build()
  }
}
