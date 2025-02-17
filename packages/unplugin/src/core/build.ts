import type { InlineConfig } from 'vite'
import type { LumiRpcOptions } from '../types'
import { build, mergeConfig } from 'vite'

export function buildServer(options: LumiRpcOptions): ReturnType<typeof build> {
  if (!options.noExternal)
    options.noExternal = true
  if (!options.minify)
    options.minify = 'esbuild'
  if (!options.outDir)
    options.outDir = 'dist/server'

  return build(mergeConfig({
    build: {
      ssr: options.entry,
      outDir: options.outDir,
      minify: options.minify,
    },
    ssr: {
      noExternal: options.noExternal,
      external: options.external,
    },
  } as InlineConfig, options.vite || {}))
}
