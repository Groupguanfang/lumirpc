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
