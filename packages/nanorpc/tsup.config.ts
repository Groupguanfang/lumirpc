import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    node: './src/node.ts',
    server: './src/server.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
