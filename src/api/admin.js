import request from './request'

// ==================== 用户管理 ====================

export function getUsersApi(params) {
  return request.get('/api/admin/users', { params })
}

export function updateUserStatusApi(userId, status) {
  return request.post(`/api/admin/users/${userId}/status`, null, {
    params: { status }
  })
}

export function batchUpdateUserStatusApi(userIds, status) {
  return request.post('/api/admin/users/batch-status', {
    userIds,
    status
  })
}

// ==================== 房源管理 ====================

export function getPropertiesApi(params) {
  return request.get('/api/admin/properties', { params })
}

export function batchUpdatePropertyStatusApi(propertyIds, status) {
  return request.post('/api/admin/properties/batch-status', {
    propertyIds,
    status
  })
}

// ==================== 订单管理 ====================

export function getBookingsApi(params) {
  return request.get('/api/admin/bookings', { params })
}

export function getBookingStatisticsApi() {
  return request.get('/api/admin/bookings/statistics')
}

export function getBookingDetailApi(bookingId) {
  return request.get(`/api/admin/bookings/${bookingId}`)
}

export function getBookingTrendApi() {
  return request.get('/api/admin/bookings/trend')
}

export function getBookingStatusDistributionApi() {
  return request.get('/api/admin/bookings/status-distribution')
}

// ==================== 评价管理 ====================

export function getReviewsApi(params) {
  return request.get('/api/admin/reviews', { params })
}

export function deleteReviewApi(reviewId) {
  return request.delete(`/api/admin/reviews/${reviewId}`)
}

// ==================== 数据导出 ====================

export function exportUsersApi(params) {
  return request.get('/api/admin/export/users', {
    params,
    responseType: 'blob'
  })
}

export function exportPropertiesApi(params) {
  return request.get('/api/admin/export/properties', {
    params,
    responseType: 'blob'
  })
}

export function exportBookingsApi(params) {
  return request.get('/api/admin/export/bookings', {
    params,
    responseType: 'blob'
  })
}
