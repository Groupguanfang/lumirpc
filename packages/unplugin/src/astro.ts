import type { MicroRpcOptions } from './types'

import unplugin from '.'

export default (options: MicroRpcOptions): any => ({
  name: 'naily:microrpc',
  hooks: {
    'astro:config:setup': async (astro: any) => {
      astro.config.vite.plugins ||= []
      astro.config.vite.plugins.push(unplugin.vite(options))
    },
  },
})
