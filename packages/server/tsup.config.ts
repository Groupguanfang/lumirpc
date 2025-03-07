import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    node: './src/node.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
