import type { Controller } from '@microrpc/server'
import type { Awaitable } from '@microrpc/types'
import type { InferController, NoThisMethodMapping } from './types'
import { nanoid } from 'nanoid'

export interface WebSocketRpcClient {
  request<T extends [string, () => Awaitable<Controller>]>(method: T[0]): NoThisMethodMapping<InferController<T[1]>, false>
  request<T extends Record<string, (...args: any[]) => any>>(method: unknown): NoThisMethodMapping<T, false>
}

export function createWebSocketRpcClient(websocketInstance: WebSocket): WebSocketRpcClient {
  function request<T extends [string, () => Awaitable<Controller>]>(method: T[0]): NoThisMethodMapping<InferController<T[1]>, false> {
    function createProxy(path: string[] = []): NoThisMethodMapping<any, false> {
      return new Proxy(async () => {}, {
        async apply(_target, _thisArg, argArray) {
          const id = nanoid()

          return new Promise((resolve, reject) => {
            websocketInstance.addEventListener('open', socket)

            function socket(): void {
              websocketInstance.send(JSON.stringify({
                jsonrpc: '2.0',
                method: `${method}.${path.join('.')}`,
                params: argArray,
                id,
              }))
              websocketInstance.addEventListener('message', listener)

              function listener(e: MessageEvent): void {
                const data = JSON.parse(e.data) || {}
                if (data.id !== id)
                  return
                if (data.error)
                  reject(data)
                else resolve(data)
                websocketInstance.removeEventListener('message', listener)
                websocketInstance.removeEventListener('open', socket)
              }
            }
          })
        },
        get(_target, p: string) {
          return createProxy([...path, p])
        },
      })
    }

    return createProxy()
  }

  return {
    request,
  }
}
