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

// 发送短信验证码
export function sendVerificationCodeApi(data) {
  return request.post('/api/auth/send-code', data)
}

// 发送邮箱验证码
export function sendEmailVerificationCodeApi(data) {
  return request.post('/api/auth/send-email-code', data)
}



