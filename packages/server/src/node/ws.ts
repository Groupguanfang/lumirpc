import type { NodeWebSocketPlugin } from '../adapter/plugin'
import defu from 'defu'
import { type Adapter, RpcException, type RpcServer } from '../adapter'

export interface NodeWebSocketServer extends RpcServer {
  listen(port: number): Promise<import('ws').Server>
  close(): Promise<void>
  overrideWebSocketOptions(overrideOptions: import('ws').ServerOptions): this
  use(plugin: NodeWebSocketPlugin): this
}

export interface NodeWebSocketAdapter extends Adapter<NodeWebSocketServer> {}

export function createNodeWebSocketAdapter(options: import('ws').ServerOptions = {}): NodeWebSocketAdapter {
  return async () => {
    const ws = await import('ws')
    let server: import('ws').Server | null = null
    const plugins: NodeWebSocketPlugin[] = []

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
      async setup(handler) {
        if (!server)
          throw new Error('Cannot call `handle()` method, because doesn\'t call listen() before.')

        server.on('connection', (ws) => {
          ws.on('message', async (data) => {
            try {
              const payload = data.toString()
              const parsed = JSON.parse(payload)

              const result = await handler({
                params: parsed.params || [],
                method: parsed.method || '',
                send: async data => ws.send(JSON.stringify(data)),
                id: parsed.id,
              })
              ws.send(JSON.stringify(result))
            }
            catch (error) {
              const rpcError = RpcException.from(error)
              ws.send(JSON.stringify(rpcError))
            }
          })
        })
      },
    }
  }
}
