import type { InlineConfig } from 'vite'

export interface MicroRpcOptions {
  /** Base URL for the MicroRPC server in development mode. @default '/api' */
  devBaseUrl?: `/${string}`
  /** Entry file for the MicroRPC server. */
  entry: string
  /** Whether to build the server after the frontend is built. @default true */
  buildOnEnd?: boolean
  /**
   * Vite configuration when build the server.
   * @default {
   *  build: {
   *    ssr: options.entry,
   *    outDir: 'dist/server',
   *  }
   * }
   */
  vite?: InlineConfig
  /**
   * Quick to set `vite.ssr.noExternal`.
   *
   * The default is `true`, so that the packaged server files can be moved and executed at will
   * (of course, you still have to have a JavaScript Runtime such as Node.js).
   *
   * But it also have some limit:
   * - When the project using some non-standard modules, such as using fs api to read a dictionary
   * and using commonjs `require` a javascript files, it maybe no work well. If you still using
   * these modules, you can set this option to `undefined` to disable this behavior.
   *
   * @default true
   */
  noExternal?: string | RegExp | (string | RegExp)[] | true
  /**
   * Quick to set `vite.ssr.external`.
   *
   * @default undefined
   */
  external?: string[] | true
  /**
   * Quick to set `vite.build.minify`.
   *
   * @default 'esbuild'
   */
  minify?: boolean | 'terser' | 'esbuild'
  /**
   * Quick to set `vite.build.outDir`.
   *
   * @default 'dist/server'
   */
  outDir?: string
}
