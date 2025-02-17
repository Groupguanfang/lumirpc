import type { MicroRpcOptions } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import vite from './vite'
import '@nuxt/schema'

export interface ModuleOptions extends MicroRpcOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'naily:microrpc',
    configKey: 'microrpc',
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))

    // ...
  },
})
