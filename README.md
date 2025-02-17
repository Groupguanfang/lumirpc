# lumirpc

Simple and type safe json-rpc 2.0 server and client solution for node.js.

## Maybe the best style for server and client communication using TS ✨

> At first, thanks for [cell.js](https://github.com/cellbang/cell) for the inspiration. 😁

Just a vite plugin:

```ts
// vite.config.ts
import LumiRpc from 'lumirpc/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    LumiRpc({
      entry: './server/main.ts',
    })
  ]
})
```

And then, create a `main.ts` file in the `server` folder, it is the entry file for the server:

```ts
// server/main.ts
import type { RpcApp } from 'lumirpc/server'
import process from 'node:process'
import { createRpcServer, InternalAdapter } from 'lumirpc/server'

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

Create a `common` folder inside the `server` folder, and create a `welcome.protocol.ts` file inside:

```ts
// server/common/welcome.protocol.ts

// Create a unique controller id, and export it
export const WelcomeController = 'WelcomeController'

// Define the controller interface, it will be used in the client and server
// You can define the same name with the controller id, this can be used as both a value and a type, and it is only imported once!
export interface WelcomeController {
  getWelcomeMessage(): Promise<string>
  getWelcomeMessageWithName(name: string): Promise<string>
}
```

Create a `controllers` folder inside the `server` folder, and create a `welcome.controller.ts` file inside:

```ts
// server/controllers/welcome.controller.ts
import { defineController } from 'lumirpc/server'
// This just import once! Very cool!
import { WelcomeController } from '../common/welcome.protocol'

// Define the controller with the controller id and the controller interface
export default defineController<WelcomeController>(WelcomeController, () => {
  return {
    async getWelcomeMessage() {
      return 'Hello World'
    },
    async getWelcomeMessageWithName(name: string) {
      return `Hello ${name}`
    },
  }
})
```

In your frontend, you can use the controller with your favorite http client, internally I make a axios helper to make it easier to use the controller for full type safety:

```ts
// apis/welcome.ts
import axios from 'axios'
import { createAxiosRpcClient } from 'lumirpc/axios'
// Same with the server side, it only import once 🍺
import { WelcomeController } from '../common/welcome.protocol'

const axiosInstance = axios.create({
  baseURL: import.meta.url ? '/api' : '/',
  method: 'POST',
})
const client = createAxiosRpcClient(axiosInstance)
// Use the controller with the controller id, it will be auto inferred type from the controller!
const welcomeController = client.request<WelcomeController>(WelcomeController)

// It return a promise and axios response object with full type safety, will be inferred from the controller!
welcomeController.getWelcomeMessage()
```

## The best DX in frontend ✍️

Many of time when we using frontend frameworks like vue, you can create a `utils` folder and create a `rpc.ts` file inside, and then write the base code:

```ts
// utils/rpc.ts
import { createAxiosRpcClient } from 'lumirpc/axios'
import { defineStore } from 'pinia'

// Using pinia to make this hook as singleton
export const useLumiRpc = defineStore('lumirpc', () => {
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
import { useLumiRpc } from '@/utils/rpc'

export function useWelcomeController() {
  const rpc = useLumiRpc()

  // Use the controller with the controller id, it will be auto inferred type from the controller!
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
