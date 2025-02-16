import axios from 'axios'
import { createAxiosRpcClient } from 'nanorpc/axios'
import { isError } from 'nanorpc/types'
import WelcomeController from '../server/controllers/welcome.controller'

const axiosInstance = axios.create({
  baseURL: import.meta.url ? '/api' : '/',
  method: 'POST',
})
const client = createAxiosRpcClient(axiosInstance)
const welcomeController = client.request<WelcomeController>(WelcomeController)

welcomeController.getWelcomeMessage()
  .then(response => response.data)
  .then((data) => {
    if (isError(data)) {
      document.querySelector('#welcome-message')!.innerHTML = `Failed to receive from server, error object:${JSON.stringify(data.error)}`
    }
    else {
      document.querySelector('#welcome-message')!.innerHTML = `Success! ${data.result}`
    }
  })

welcomeController.getWelcomeMessageWithName('John')
  .then(response => response.data)
  .then((data) => {
    if (isError(data)) {
      document.querySelector('#welcome-message-2')!.innerHTML = `Failed to receive from server, error object:${JSON.stringify(data.error)}`
    }
    else {
      document.querySelector('#welcome-message-2')!.innerHTML = `Success! ${data.result}`
    }
  })
