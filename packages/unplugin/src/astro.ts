import type { LumiRpcOptions } from './types'

import unplugin from '.'

export default (options: LumiRpcOptions): any => ({
  name: 'naily:lumirpc',
  hooks: {
    'astro:config:setup': async (astro: any) => {
      astro.config.vite.plugins ||= []
      astro.config.vite.plugins.push(unplugin.vite(options))
    },
  },
})
