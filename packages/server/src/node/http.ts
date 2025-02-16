import type { Buffer } from 'node:buffer'
import type { NodeHttpAfterHandleContext, NodeHttpBeforeHandleContext, NodeHttpOnErrorContext, NodeHttpPlugin } from '../adapter/plugin'
import { type Adapter, RpcException, type RpcServer } from '../adapter'
import { executePluginHook } from '../adapter/plugin'

export interface NodeHttpServer extends RpcServer {
  listen(port: number): Promise<import('http').Server>
  close(): Promise<void>
  use(plugin: NodeHttpPlugin): this
}

export interface NodeHttpAdapter extends Adapter<NodeHttpServer> {}

export function createNodeHttpAdapter(): NodeHttpAdapter {
  async function getBeforeHandleMiddlewares(plugins: NodeHttpPlugin[]): Promise<Parameters<NodeHttpBeforeHandleContext['use']>[0][]> {
    const middlewares: Parameters<NodeHttpBeforeHandleContext['use']>[0][] = []
    await executePluginHook(plugins, 'beforeHandle', [
      {
        use(middleware) {
          middlewares.push(middleware)
          return this as NodeHttpBeforeHandleContext
        },
      },
    ])
    return middlewares
  }

  async function getAfterHandleMiddlewares(plugins: NodeHttpPlugin[]): Promise<Parameters<NodeHttpAfterHandleContext['use']>[0][]> {
    const middlewares: Parameters<NodeHttpAfterHandleContext['use']>[0][] = []
    await executePluginHook(plugins, 'afterHandle', [
      {
        use(middleware) {
          middlewares.push(middleware)
          return this as NodeHttpAfterHandleContext
        },
      },
    ])
    return middlewares
  }

  async function getOnErrorMiddlewares(plugins: NodeHttpPlugin[]): Promise<Parameters<NodeHttpOnErrorContext['use']>[0][]> {
    const middlewares: Parameters<NodeHttpOnErrorContext['use']>[0][] = []
    await executePluginHook(plugins, 'onError', [
      {
        use(middleware) {
          middlewares.push(middleware)
          return this as NodeHttpOnErrorContext
        },
      },
    ])
    return middlewares
  }

  return async () => {
    const http = await import('node:http')
    let server: import('node:http').Server | null = null
    const { Buffer } = await import('node:buffer')
    const plugins: NodeHttpPlugin[] = []

    return {
      async listen(port: number) {
        if (server) {
          const msg = 'Cannot call `listen()` method, because already called, call `close()` before!'
          console.warn(msg)
          throw new Error(msg)
        }
        server = http.createServer()
        return server.listen(port)
      },
      close() {
        return new Promise((resolve, reject) => {
          if (!server)
            return console.warn('Cannot call `close()` method, because doesn\'t call listen() before.')
          server.close(err => err ? reject(err) : resolve())
        })
      },
      use(plugin: NodeHttpPlugin) {
        plugins.push(plugin)
        return this as NodeHttpServer
      },
      async setup(handler) {
        if (!server)
          throw new Error('Cannot call `handle()` method, because doesn\'t call listen() before.')

        const middlewares = await getBeforeHandleMiddlewares(plugins)
        server.on('request', async (req, res) => {
          const body = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = []
            req.on('data', chunk => chunks.push(chunk))
            req.on('end', () => resolve(Buffer.concat(chunks)))
            req.on('error', reject)
          }).then(body => body.toString())

          // Execute before handle middlewares
          for (const middleware of middlewares)
            await middleware(req, res)
          if (res.writableEnded)
            return

          // Execute handler
          try {
            const parsedBody = JSON.parse(body)
            const result = await handler({
              params: parsedBody.params || [],
              method: parsedBody.method || '',
              send: () => { throw new Error('Http server does not support send method.') },
              id: parsedBody.id,
            })

            // Execute after handle middlewares
            const afterHandleMiddlewares = await getAfterHandleMiddlewares(plugins)
            for (const middleware of afterHandleMiddlewares)
              await middleware(req, res)

            if (res.writableEnded)
              return
            res.setHeader('Content-Type', 'application/json')
              .end(JSON.stringify(result))
          }
          catch (error) {
            const onErrorMiddlewares = await getOnErrorMiddlewares(plugins)
            for (const middleware of onErrorMiddlewares)
              await middleware(req, res)
            if (res.writableEnded)
              return

            const rpcError = RpcException.from(error)
            res.setHeader('Content-Type', 'application/json')
              .end(JSON.stringify(rpcError))
          }
        })
      },
    }
  }
}
