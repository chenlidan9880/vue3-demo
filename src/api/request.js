import axios from 'axios'

// 创建 Axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8082', // 后端服务地址
  timeout: 10000
})

// 请求拦截器：自动携带 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default request


















