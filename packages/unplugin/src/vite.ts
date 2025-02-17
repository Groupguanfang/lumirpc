import type { MicroRpcOptions } from '.'
import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from '.'

export default createVitePlugin(unpluginFactory) as (options: MicroRpcOptions) => any
