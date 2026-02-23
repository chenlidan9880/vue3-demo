import request from './request'

// 用户注册
export function registerApi(data) {
  return request.post('/api/auth/register', data)
}

// 用户登录
export function loginApi(data) {
  return request.post('/api/auth/login', data)
}

// 获取当前登录用户信息（基于 JWT）
export function getCurrentUserApi() {
  return request.get('/api/auth/me')
}



