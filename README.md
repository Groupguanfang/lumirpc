# nanorpc

Simple and type safe json-rpc 2.0 server and client solution for node.js.

## Maybe the best style for server and client communication using TS ✨

> At first, thanks for [cell.js](https://github.com/cellbang/cell) for the inspiration. 😁

Just a vite plugin:

```ts
import NanoRpc from 'nanorpc/vite'
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    NanoRpc({
      entry: './server/main.ts',
    })
  ]
})
```

And then, create a `main.ts` file in the `server` folder:

```ts
// server/main.ts
import type { RpcApp } from 'nanorpc/server'
import process from 'node:process'
import { createRpcServer, InternalAdapter } from 'nanorpc/server'

import.meta.glob('./controllers/**/*.controller.ts', { eager: true })

export default async function main(): Promise<RpcApp> {
  const server = await createRpcServer(InternalAdapter.NodeHttp)
  if (import.meta.env.PROD)
    await server.listen(process.env.PORT ? Number.parseInt(process.env.PORT) : 3444)
  return server
}

if (import.meta.env.PROD)
  main()
```

Create a `controllers` folder inside the `server` folder:

```ts
// server/controllers/welcome.controller.ts
import { defineController } from 'nanorpc/server'

export const WelcomeController = 'WelcomeController'

export const welcomeController = defineController(WelcomeController, {
  async getWelcomeMessage() {
    return 'Hello World'
  },
  async getWelcomeMessageWithName(name: string) {
    return `Hello ${name}`
  },
})

export type WelcomeController = typeof welcomeController
export default WelcomeController
```

In your frontend, you can use the controller with your favorite http client, internally I make a axios helper to make it easier to use the controller for full type safety:

```ts
import { createAxiosRpcClient } from 'nanorpc/axios'

const axiosInstance = axios.create({
  baseURL: import.meta.url ? '/api' : '/',
  method: 'POST',
})
const client = createAxiosRpcClient(axiosInstance)
const welcomeController = client.request<WelcomeController>(WelcomeController)

// It return a promise and axios response object with full type safety, will be inferred from the controller!
welcomeController.getWelcomeMessage()
```

## The best DX ✍️

Many of time when we using frontend frameworks like vue, you can create a `utils` folder and create a `rpc.ts` file inside, and then write the base code:

```ts
// utils/rpc.ts
import { createAxiosRpcClient } from 'nanorpc/axios'
import { defineStore } from 'pinia'

// Using pinia to make this hook as singleton
export const useNanoRpc = defineStore('nanorpc', () => {
  const axiosInstance = axios.create({
    baseURL: import.meta.url ? '/api' : '/',
    method: 'POST',
  })

  return createAxiosRpcClient(axiosInstance)
})
```

Create a `apis` folder and create a `welcome.ts` file inside:

```ts
// apis/welcome.ts
import { useNanoRpc } from '@/utils/rpc'

export function useWelcomeController() {
  const rpc = useNanoRpc()

  return rpc.request<WelcomeController>(WelcomeController)
}
```

You can inport this `useWelcomeController` hook in your component and use it directly, also have full type safety!

```vue
// components/Welcome.vue
<script setup lang="ts">
import { useWelcomeController } from '@/apis/welcome'

const welcomeController = useWelcomeController()

// Write your logic here... 🪄
const { data } = await welcomeController.getWelcomeMessage()
</script>
```

## Author

[Naily Zero](https://github.com/groupguanfang)

## License

MIT
