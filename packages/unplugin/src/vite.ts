import type { LumiRpcOptions } from '.'
import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from '.'

export default createVitePlugin(unpluginFactory) as (options: LumiRpcOptions) => any
