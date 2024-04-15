import axios, { type AxiosInstance } from 'axios'

const request: AxiosInstance = axios.create({
  baseURL: 'http://localhost:2000',
  timeout: 5000
})

// TODO 处理code不为200的情况

export default request