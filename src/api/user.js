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

/**
 * 根据用户ID获取用户信息
 */
export function getUserByIdApi(userId) {
  return request({
    url: `/api/user/${userId}`,
    method: 'get'
  })
}

/**
 * 上传用户头像
 */
export function uploadAvatarApi(file) {
  const formData = new FormData()
  formData.append('files', file)
  return request({
    url: '/api/host/upload/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}















