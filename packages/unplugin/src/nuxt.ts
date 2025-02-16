import type { NanoRpcOptions } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import vite from './vite'
import '@nuxt/schema'

export interface ModuleOptions extends NanoRpcOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'naily:nanorpc',
    configKey: 'nanorpc',
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))

    // ...
  },
})
