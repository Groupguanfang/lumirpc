import type { Result } from '@microrpc/types'
import { createRpcServer, defineController, InternalAdapter } from '@microrpc/server'
import { typeAssert } from '@microrpc/types'
import { expect, it } from 'vitest'
import { WebSocket } from 'ws'
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
  const client = createWebSocketRpcClient(ws as unknown as globalThis.WebSocket)
  const testController = client.request<NodeSocketTestController>(NodeSocketTestController)
  const response = await testController.add(1, 2)
  typeAssert<Result>(response)
  expect(response.result).toBe(3)
})
