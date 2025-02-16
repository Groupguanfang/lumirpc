import type { RpcApp } from 'nanorpc/server'
import process from 'node:process'
import { createRpcServer, InternalAdapter } from 'nanorpc/server'

import.meta.glob('./controllers/**/*.controller.ts', { eager: true })

export default async function main(): Promise<RpcApp> {
  const server = await createRpcServer(InternalAdapter.NodeHttp)
  if (import.meta.env.PROD)
    await server.listen(process.env.PORT ? Number.parseInt(process.env.PORT) : 3444)
  return server
}

if (import.meta.env.PROD)
  main()
