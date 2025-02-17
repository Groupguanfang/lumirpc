import type { Controller, ControllerContext } from '@microrpc/server'
import type { Awaitable, Error, Result } from '@microrpc/types'
import type { AxiosResponse } from 'axios'

export type InferPromise<T> = T extends Promise<infer R> ? R : T

export type NoThisMethodMapping<T extends Controller, Axios extends boolean = true> = {
  [K in keyof T]: T[K] extends (this: ControllerContext, ...args: infer P) => infer R
    // Only infer args, not `this`
    ? (...args: P) => Axios extends true
        ? Promise<AxiosResponse<Result<InferPromise<R>> | Error<InferPromise<R>>>>
        : Promise<Result<InferPromise<R>> | Error<InferPromise<R>>>
    : T[K]
}

export type InferController<T extends () => Awaitable<Controller>> = T extends () => Awaitable<infer R> ? R : Controller
