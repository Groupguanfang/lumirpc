import type { NanoRpcOptions } from '.'
import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from '.'

export default createVitePlugin(unpluginFactory) as (options: NanoRpcOptions) => any
