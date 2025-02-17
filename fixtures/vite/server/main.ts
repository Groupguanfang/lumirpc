import type { RpcApp } from 'nanorpc/server'
import process from 'node:process'
import { createLoggerPlguin } from '@nanorpc/logger'
import { createRpcServer, InternalAdapter } from 'nanorpc/server'

import.meta.glob('./controllers/**/*.controller.ts', { eager: true })

export default async function main(): Promise<RpcApp> {
  const server = await createRpcServer(InternalAdapter.NodeHttp)
  const logger = await createLoggerPlguin({})
  server.use(logger.Http)

  if (import.meta.env.PROD) {
    await server.listen(process.env.PORT ? Number.parseInt(process.env.PORT) : 3444)
      // eslint-disable-next-line no-console
      .then(() => console.log('Server is running on http://localhost:3444'))
  }
  return server
}

if (import.meta.env.PROD)
  main()
