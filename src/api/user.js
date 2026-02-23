import request from './request'

/**
 * 获取当前用户信息
 */
export function getUserProfileApi() {
  return request({
    url: '/api/user/profile',
    method: 'get'
  })
}

/**
 * 更新用户信息
 */
export function updateUserProfileApi(data) {
  return request({
    url: '/api/user/profile',
    method: 'put',
    data
  })
}















