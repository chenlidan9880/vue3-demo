import request from './request'

// 房东：新增房源
export function createPropertyApi(data) {
  return request.post('/api/host/properties', data)
}

// 房东：编辑房源
export function updatePropertyApi(id, data) {
  return request.put(`/api/host/properties/${id}`, data)
}

// 房东：我的房源列表
export function getMyPropertiesApi() {
  return request.get('/api/host/properties/my')
}

// 房东：上架房源
export function publishPropertyApi(id) {
  return request.post(`/api/host/properties/${id}/publish`)
}

// 房东：下架房源
export function unpublishPropertyApi(id) {
  return request.post(`/api/host/properties/${id}/unpublish`)
}

// 房东：设置房源价格
export function updatePricingApi(id, data) {
  return request.put(`/api/host/properties/${id}/pricing`, data)
}

// 房东：上传房源图片到 OSS
export function uploadPropertyImagesApi(formData) {
  return request.post('/api/host/upload/images', formData)
}





