import type { type Controller, ControllerContext } from '@nanorpc/server'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { nanoid } from 'nanoid'

export type InferPromise<T> = T extends Promise<infer R> ? R : T

export type NoThisMethodMapping<T extends Controller> = {
  [K in keyof T]: T[K] extends (this: ControllerContext, ...args: infer P) => infer R
    ? (...args: P) => Promise<AxiosResponse<InferPromise<R>>>
    : T[K]
}

export interface AxiosRpcClient {
  request<T extends [string, Controller]>(method: T[0]): NoThisMethodMapping<T[1]>
}

export interface AxiosRpcClientOptions {
  ssr?: boolean
}

export function createEmptyReadonlyProxy(): Record<any, any> {
  return new Proxy(() => {}, {
    get() {
      return createEmptyReadonlyProxy()
    },
    apply() {
      return createEmptyReadonlyProxy()
    },
    construct() {
      return createEmptyReadonlyProxy()
    },
  })
}

export function createAxiosRpcClient(axiosInstance: AxiosInstance, options: AxiosRpcClientOptions = {}): AxiosRpcClient {
  function request<T extends [string, Controller]>(method: T[0]): NoThisMethodMapping<T[1]> {
    function createProxy(path: string[] = []): NoThisMethodMapping<any> {
      return new Proxy(async () => {}, {
        async apply(_target, _thisArg, argArray) {
          if (options && options.ssr)
            return createEmptyReadonlyProxy()

          const response = await axiosInstance({
            data: {
              jsonrpc: '2.0',
              method: `${method}.${path.join('.')}`,
              params: argArray,
              id: nanoid(),
            },
          })

          return response
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
