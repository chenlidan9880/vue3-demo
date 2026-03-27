import request from './request'

// 发送消息给房东
export function sendMessageApi(propertyId, content) {
  return request.post('/api/messages/send', null, {
    params: {
      propertyId,
      content
    }
  })
}

// 发送消息给用户（用于聊天回复）
export function sendMessageToUserApi(receiverId, content, propertyId) {
  return request.post('/api/messages/send-to-user', {
    receiverId,
    content,
    propertyId
  })
}

// 获取收到的消息列表
export function getReceivedMessagesApi() {
  return request.get('/api/messages/received')
}

// 获取发送的消息列表
export function getSentMessagesApi() {
  return request.get('/api/messages/sent')
}

// 获取聊天会话列表
export function getChatSessionsApi() {
  return request.get('/api/messages/sessions')
}

// 标记消息为已读
export function markMessageAsReadApi(messageId) {
  return request.put(`/api/messages/${messageId}/read`)
}

// 获取与特定用户的聊天记录
export function getChatHistoryApi(userId) {
  return request.get(`/api/messages/chat/${userId}`)
}

// 标记与特定用户的所有消息为已读
export function markAllAsReadApi(userId) {
  return request.put(`/api/messages/chat/${userId}/read-all`)
}
