import type { Controller } from 'lumirpc/server'

export const WelcomeController = 'WelcomeController'
export interface WelcomeController extends Controller {
  /**
   * Get a welcome message
   * @returns 'Hello World'
   */
  getWelcomeMessage(): Promise<string>
  /**
   * Get a welcome message with a name
   * @param name - The name to include in the message
   * @returns `Hello ${name}`
   */
  getWelcomeMessageWithName(name: string): Promise<string>
}
