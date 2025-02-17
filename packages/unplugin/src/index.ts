import type { RpcApp } from '@microrpc/server'
import type { UnpluginFactory } from 'unplugin'
import type { MicroRpcOptions } from './types'
import { exit } from 'node:process'
import { executePluginHook } from '@microrpc/server'
import { createNodeLikeHandler } from '@microrpc/server/node'
import { createUnplugin } from 'unplugin'
import { buildServer } from './core/build'

export type { MicroRpcOptions }
export * from './core/build'

export const unpluginFactory: UnpluginFactory<MicroRpcOptions> = (options, _meta) => {
  if (!options.devBaseUrl)
    options.devBaseUrl = '/api'
  if (!options.noExternal)
    options.noExternal = true
  if (!options.minify)
    options.minify = 'esbuild'
  if (!options.outDir)
    options.outDir = 'dist/server'

  return {
    name: 'naily:microrpc',

    vite: {
      config(config) {
        if (!config || !config.build || !config.build.outDir) {
          config = config || {}
          config.build = config.build || {}
          if (!config.build.outDir)
            config.build.outDir = 'dist/client'
        }
      },

      async configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith(options.devBaseUrl!))
            return next()
          const mod = await server.ssrLoadModule(options.entry, { fixStacktrace: true }) || {}
          if (!mod.default)
            throw new Error('The microrpc server entry file must have a default export.')
          const defaultExport: RpcApp = typeof mod.default === 'function' ? await mod.default() : mod.default
          if (typeof defaultExport !== 'object' || typeof defaultExport.getAppHandler !== 'function' || typeof defaultExport.getPlugins !== 'function')
            throw new Error('The microrpc server entry file must export a default function that returns an RpcApp object or an object that implements the RpcApp interface.')

          await executePluginHook(defaultExport.getPlugins(), 'install', [])
          const nodeHttpHandler = await createNodeLikeHandler(defaultExport.getPlugins())
          await nodeHttpHandler(req, res, defaultExport.getAppHandler())
        })
      },

      closeBundle() {
        if (options.buildOnEnd === false)
          return
        buildServer(options).then(() => exit(0))
      },
    },
  }
}

export const MicroRpcUnplugin = createUnplugin(unpluginFactory)
export default MicroRpcUnplugin
