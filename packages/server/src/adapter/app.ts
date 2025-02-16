import type { Result } from '@nanorpc/types'
import type { NodeHttpServer, NodeWebSocketServer } from '../node'
import type { Adapter, Handler, InferPromise } from './adapter'
import type { Plugin } from './plugin'
import { createErrorBuilder, createResultBuilder } from '@nanorpc/types'
import { get } from 'lodash-es'
import { nanoid } from 'nanoid'
import { createNodeHttpAdapter, createNodeWebSocketAdapter } from '../node'
import { ControllerCollector } from './collector'

export interface RpcServer {
  listen(port: number): Promise<unknown>
  close(): Promise<void>
  setup(handler: Handler): Promise<void>
  use(plugin: Plugin): this
}

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

function isInternalAdapter(adapter: unknown): adapter is InternalAdapter {
  return typeof adapter === 'number' && adapter in InternalAdapter
}

/**
 * Create a new RPC server.
 *
 * @param adapter - The adapter to use.
 */
export async function createRpcServer<TAdapter extends Adapter = Adapter>(adapter: TAdapter): Promise<InferPromise<ReturnType<TAdapter>>>
/**
 * Create a new RPC server using the Node.js HTTP adapter.
 *
 * @param adapter
 */
export async function createRpcServer(adapter: InternalAdapter.NodeHttp): Promise<NodeHttpServer>
/**
 * Create a new RPC server using the Node.js WebSocket adapter.
 *
 * @param adapter
 */
export async function createRpcServer(adapter: InternalAdapter.NodeWebSocket): Promise<NodeWebSocketServer>
export async function createRpcServer<TAdapter extends Adapter = Adapter>(adapter: TAdapter | InternalAdapter): Promise<InferPromise<ReturnType<TAdapter>>> {
  const adapterServer = await createAdapterServer(adapter)

  async function handleRequest(): Promise<void> {
    await adapterServer.setup(async (ctx) => {
      const [controllerName, ...methodNameArray] = ctx.method.split('.')
      const controller = ControllerCollector.container.get(controllerName)
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
    })
  }

  return {
    ...adapterServer,
    async listen(port) {
      const listener = await adapterServer.listen(port)
      await handleRequest()
      return listener
    },
  } as InferPromise<ReturnType<TAdapter>>
}

async function createAdapterServer(adapter: InternalAdapter | Adapter): Promise<InferPromise<ReturnType<Adapter>>> {
  switch (adapter) {
    case InternalAdapter.NodeHttp:
      return await createNodeHttpAdapter()()
    case InternalAdapter.NodeWebSocket:
      return await createNodeWebSocketAdapter()()
  }

  if (!isInternalAdapter(adapter))
    return await adapter()

  throw new TypeError('Invalid adapter, cannot create RPC server.')
}
