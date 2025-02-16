/* eslint-disable no-console */
import { createRpcServer, defineController, InternalAdapter } from '../src'

export default defineController('test', {
  async hello() {
    return 'Hello, world!'
  },
})

createRpcServer(InternalAdapter.NodeHttp)
  .then(_ => _.use({ name: 'test' }))
  .then(server => server.listen(3012))
  .then(() => console.log('Server is running on port http://localhost:3012'))
