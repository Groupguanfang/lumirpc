import type { Controller } from '@nanorpc/server'
import type { NoThisMethodMapping } from './types'
import { nanoid } from 'nanoid'
import { createEmptyReadonlyProxy } from './utils'

export interface AxiosRpcClient {
  request<T extends [string, Controller]>(method: T[0]): NoThisMethodMapping<T[1]>
}

export interface AxiosRpcClientOptions {
  ssr?: boolean
}

export function createAxiosRpcClient<Axios extends import('axios').AxiosInstance>(axiosInstance: Axios, options: AxiosRpcClientOptions = {}): AxiosRpcClient {
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
