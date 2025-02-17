import type { Result } from '@nano-rpc/types'
import { createRpcServer, defineController, InternalAdapter } from '@nano-rpc/server'
import { typeAssert } from '@nano-rpc/types'
import { expect, it } from 'vitest'
import { createWebSocketRpcClient } from '../src/socket'

it('should work with node socket', async () => {
  const PORT = 3006
  const NodeSocketTestController = 'SocketTestController'
  const _testController = defineController(NodeSocketTestController, () => {
    return {
      add: async (a: number, b: number) => a + b,
    }
  })
  type NodeSocketTestController = typeof _testController

  const server = await createRpcServer(InternalAdapter.NodeWebSocket)
  await server.listen(PORT)

  const ws = new WebSocket(`ws://localhost:${PORT}`)
  const client = createWebSocketRpcClient(ws)
  const testController = client.request<NodeSocketTestController>(NodeSocketTestController)
  const response = await testController.add(1, 2)
  typeAssert<Result>(response)
  expect(response.result).toBe(3)
})
