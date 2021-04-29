import axios from 'axios'
import store from '../store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    if (store.getters['user/token']) {
      config.headers['authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

export default service
