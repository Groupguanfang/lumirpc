import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    axios: './src/axios.ts',
    socket: './src/socket.ts',
  },
  dts: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
})
