import LumiRpc from 'lumirpc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    LumiRpc({
      entry: './server/main.ts',
      devBaseUrl: '/api',
    }),
  ],
})
