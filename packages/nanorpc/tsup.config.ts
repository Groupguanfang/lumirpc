import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    node: './src/node.ts',
    server: './src/server.ts',
    axios: './src/axios.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
