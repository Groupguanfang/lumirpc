import type { RpcApp } from '@nanorpc/server'
import type { UnpluginFactory } from 'unplugin'
import type { NanoRpcOptions } from './types'
import { executePluginHook } from '@nanorpc/server'
import { createNodeLikeHandler } from '@nanorpc/server/node'
import { createUnplugin } from 'unplugin'

export type { NanoRpcOptions }

export const unpluginFactory: UnpluginFactory<NanoRpcOptions> = (options) => {
  if (!options.devBaseUrl)
    options.devBaseUrl = '/api'

  return {
    name: 'naily:nanorpc',
    vite: {
      async configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith(options.devBaseUrl!))
            return next()
          const mod = await server.ssrLoadModule(options.entry, { fixStacktrace: true }) || {}
          if (!mod.default)
            throw new Error('The nanorpc server entry file must have a default export.')
          const defaultExport: RpcApp = typeof mod.default === 'function' ? await mod.default() : mod.default
          if (typeof defaultExport !== 'object' || typeof defaultExport.getAppHandler !== 'function' || typeof defaultExport.getPlugins !== 'function')
            throw new Error('The nanorpc server entry file must export a default function that returns an RpcApp object or an object that implements the RpcApp interface.')

          await executePluginHook(defaultExport.getPlugins(), 'install', [])
          const nodeHttpHandler = await createNodeLikeHandler(defaultExport.getPlugins())
          await nodeHttpHandler(req, res, defaultExport.getAppHandler())
        })
      },
    },
  }
}

export const NanoRpcUnplugin = createUnplugin(unpluginFactory)
export default NanoRpcUnplugin
