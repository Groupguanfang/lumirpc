/* eslint-disable ts/no-redeclare */
import type { Result } from '@nanorpc/types'
import type { AxiosInstance } from 'axios'
import { createRpcServer, defineController, InternalAdapter } from '@nanorpc/server'
import { typeAssert } from '@nanorpc/types'
import axios from 'axios'
import { expect, it } from 'vitest'
import { createAxiosRpcClient } from '../src/axios'

it('should work with node http', async () => {
  const PORT = 3005
  const NodeHttpTestController = 'HttpTestController'
  const _testController = defineController(NodeHttpTestController, {
    add: async (a: number, b: number) => {
      return a + b
    },
  })
  type NodeHttpTestController = typeof _testController

  const server = await createRpcServer(InternalAdapter.NodeHttp)
  await server.listen(PORT)

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: `http://localhost:${PORT}`,
  })
  const client = createAxiosRpcClient(axiosInstance)
  const testController = client.request<NodeHttpTestController>(NodeHttpTestController)
  const result = await testController.add(1, 2)
  typeAssert<Result>(result.data)
  expect(result.data.result).toBe(3)
})
