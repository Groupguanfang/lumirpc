import { defineController } from 'lumirpc/server'
import { WelcomeController } from '../../common/welcome.protocol'

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
