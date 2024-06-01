import axios, { type AxiosInstance } from 'axios'
import { toast } from '@/components/ui/use-toast'

const request: AxiosInstance = axios.create({
  // 这个不应该写死
  baseURL: 'http://localhost:4000'
  // timeout: 5000
})

request.interceptors.response.use(
  (res) => {
    return res.data
  },
  (error) => {
    console.log('reject', error)
    toast({
      variant: 'destructive',
      description: 'request error',
      duration: 3000
    })
    return Promise.reject(error)
  }
)

export default request
