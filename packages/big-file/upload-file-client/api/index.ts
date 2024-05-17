import axios, { type AxiosInstance } from 'axios'

const request: AxiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 5000
})

request.interceptors.response.use((res) => res.data)

// TODO 处理code不为200的情况

export default request
