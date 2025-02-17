import MicroRpc from 'microrpc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    MicroRpc({
      entry: './server/main.ts',
      devBaseUrl: '/api',
    }),
  ],
})
