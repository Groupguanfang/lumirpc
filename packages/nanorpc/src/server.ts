/* eslint-disable no-console */
import { createRpcServer, InternalAdapter } from '@nanorpc/server'

export * from '@nanorpc/server'

createRpcServer(InternalAdapter.NodeHttp)
  .then(_ => _.listen(3000))
  .then(() => console.log('Server is running on port 3000'))
  .catch(err => console.error(err))
