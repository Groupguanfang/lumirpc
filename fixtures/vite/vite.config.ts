import NanoRpc from 'nanorpc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    NanoRpc({
      entry: './server/main.ts',
      devBaseUrl: '/api',
    }),
  ],
})
