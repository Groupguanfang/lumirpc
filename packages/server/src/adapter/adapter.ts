import type { Error, Result } from '@nanorpc/types'
import type { RpcServer } from './app'
import type { ControllerContext } from './collector'

export interface Adapter<TServer extends RpcServer = RpcServer> {
  (): TServer | Promise<TServer>
}

export type InferPromise<T> = T extends Promise<infer U> ? U : T

export enum HandlerType {
  Success,
  Error,
}

export interface HandlerContext extends ControllerContext {
  params: Record<string, any> | unknown[]
  method: string
  id?: string | number
}

export interface Handler {
  (ctx: HandlerContext): Promise<Result | Error>
}
