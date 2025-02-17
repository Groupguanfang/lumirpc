import type { RpcApp } from 'microrpc/server'
import process from 'node:process'
import { createLoggerPlguin } from '@microrpc/logger'
import { createRpcServer, InternalAdapter } from 'microrpc/server'

// Quickly import all controllers ✨
import.meta.glob('./controllers/**/*.controller.ts', { eager: true })

export default async function main(): Promise<RpcApp> {
  const server = await createRpcServer(InternalAdapter.NodeHttp)
  const logger = await createLoggerPlguin({})
  server.use(logger.Http)

  // In production, listen on the port specified in the environment variable
  if (import.meta.env.PROD) {
    await server.listen(process.env.PORT ? Number.parseInt(process.env.PORT) : 3444)
      // eslint-disable-next-line no-console
      .then(() => console.log('Server is running on http://localhost:3444'))
  }

  // Return the server to be used by the vite ⚡️
  return server
}

// In production, run the server
if (import.meta.env.PROD)
  main()
