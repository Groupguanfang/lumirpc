import type { LumiRpcOptions } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import vite from './vite'
import '@nuxt/schema'

export interface ModuleOptions extends LumiRpcOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'naily:lumirpc',
    configKey: 'lumirpc',
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))

    // ...
  },
})
