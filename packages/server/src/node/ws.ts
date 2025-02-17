import type { Awaitable } from '@microrpc/types'
import type { Adapter, RpcServer } from '../adapter'
import type { NodeWebSocketAfterHandleContext, NodeWebSocketBeforeHandleContext, NodeWebSocketOnErrorContext, NodeWebSocketPlugin } from '../adapter/plugin'
import defu from 'defu'
import { executePluginHook, RpcException } from '../adapter'

export interface NodeWebSocketServer extends RpcServer {
  listen(port: number): Promise<import('ws').Server>
  close(): Promise<void>
  overrideWebSocketOptions(overrideOptions: import('ws').ServerOptions): this
  use(plugin: Awaitable<NodeWebSocketPlugin>): this
}

export interface NodeWebSocketAdapter extends Adapter<NodeWebSocketServer> {}

export function createNodeWebSocketAdapter(options: import('ws').ServerOptions = {}): NodeWebSocketAdapter {
  return async () => {
    const ws = await import('ws')
    let server: import('ws').Server | null = null
    const plugins: Awaitable<NodeWebSocketPlugin>[] = []

    async function getBeforeHandleMiddlewares(plugins: Awaitable<NodeWebSocketPlugin>[]): Promise<Parameters<NodeWebSocketBeforeHandleContext['use']>[0][]> {
      const middlewares: Parameters<NodeWebSocketBeforeHandleContext['use']>[0][] = []
      await executePluginHook(plugins, 'beforeHandle', [
        {
          use(middleware) {
            middlewares.push(middleware)
            return this as NodeWebSocketBeforeHandleContext
          },
        },
      ])
      return middlewares
    }

    async function getAfterHandleMiddlewares(plugins: Awaitable<NodeWebSocketPlugin>[]): Promise<Parameters<NodeWebSocketAfterHandleContext['use']>[0][]> {
      const middlewares: Parameters<NodeWebSocketAfterHandleContext['use']>[0][] = []
      await executePluginHook(plugins, 'afterHandle', [
        {
          use(middleware) {
            middlewares.push(middleware)
            return this as NodeWebSocketAfterHandleContext
          },
        },
      ])
      return middlewares
    }

    async function getOnErrorMiddlewares(plugins: Awaitable<NodeWebSocketPlugin>[]): Promise<Parameters<NodeWebSocketOnErrorContext['use']>[0][]> {
      const middlewares: Parameters<NodeWebSocketOnErrorContext['use']>[0][] = []
      await executePluginHook(plugins, 'onError', [
        {
          use(middleware) {
            middlewares.push(middleware)
            return this as NodeWebSocketOnErrorContext
          },
        },
      ])
      return middlewares
    }

    return {
      overrideWebSocketOptions(overrideOptions) {
        options = defu(overrideOptions, options)
        return this as NodeWebSocketServer
      },
      async listen(port) {
        if (server) {
          const msg = 'Cannot call `listen()` method, because already called, call `close()` before!'
          console.warn(msg)
          throw new Error(msg)
        }
        server = new ws.WebSocketServer({
          ...options,
          port,
        })
        return server
      },
      close() {
        return new Promise((resolve, reject) => {
          if (!server)
            return console.warn('Cannot call `close()` method, because doesn\'t call listen() before.')
          server.close(err => err ? reject(err) : resolve())
        })
      },
      use(plugin: NodeWebSocketPlugin) {
        plugins.push(plugin)
        return this as NodeWebSocketServer
      },
      getPlugins() {
        return plugins
      },
      async setup(handler) {
        if (!server)
          throw new Error('Cannot call `handle()` method, because doesn\'t call listen() before.')

        server.on('connection', (ws) => {
          ws.on('message', async (data) => {
            try {
              const beforeMiddlewares = await getBeforeHandleMiddlewares(plugins)
              for (const middleware of beforeMiddlewares)
                await middleware(ws)
              const payload = data.toString()
              const parsed = JSON.parse(payload)

              const result = await handler({
                params: parsed.params || [],
                method: parsed.method || '',
                send: async data => ws.send(JSON.stringify(data)),
                id: parsed.id,
              })
              ws.send(JSON.stringify(result))
              const afterMiddlewares = await getAfterHandleMiddlewares(plugins)
              for (const middleware of afterMiddlewares)
                await middleware(ws)
            }
            catch (error) {
              const onErrorMiddlewares = await getOnErrorMiddlewares(plugins)
              for (const middleware of onErrorMiddlewares)
                await middleware(ws)

              const rpcError = RpcException.from(error)
              ws.send(JSON.stringify(rpcError))
            }
          })
        })
      },
    }
  }
}
