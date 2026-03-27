<template>
  <div class="chat-page">
    <!-- 聊天头部 -->
    <header class="chat-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">‹</span>
        <span class="back-text">返回</span>
      </button>
      <div class="chat-title">
        <h2>{{ chatPartnerName }}</h2>
        <span class="online-status" v-if="isOnline">在线</span>
      </div>
      <button class="more-btn" @click="showMoreOptions">
        <span class="more-icon">⋮</span>
      </button>
    </header>

    <!-- 聊天内容区域 -->
    <main class="chat-content" ref="chatContent">
      <div class="message-list" v-if="loading">
        <div class="loading">加载中...</div>
      </div>

      <div class="message-list" v-else-if="messages.length === 0">
        <div class="empty-chat">
          <div class="empty-icon">💬</div>
          <p>开始和房东聊天吧</p>
          <p class="empty-subtitle">您可以询问房源详情、入住时间等问题</p>
        </div>
      </div>

      <div class="message-list" v-else>
        <!-- 加载更多消息 -->
        <div class="load-more" v-if="hasMoreMessages">
          <button @click="loadMoreMessages" :disabled="loadingMore">
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>

        <!-- 消息列表 -->
        <div 
          v-for="(message, index) in messages" 
          :key="message.id"
          class="message-item"
          :class="{ 
            'self-message': message.senderId === currentUserId,
            'other-message': message.senderId !== currentUserId
          }"
        >
          <!-- 时间分割线 -->
          <div class="time-divider" v-if="showTimeDivider(message, index)">
            {{ formatTime(message.createTime) }}
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <!-- 头像 -->
            <div class="avatar">
              <img 
                :src="getAvatar(message.senderId)" 
                :alt="getUserName(message.senderId)"
                @error="handleAvatarError"
              />
            </div>

            <!-- 消息气泡 -->
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-status">
                <span class="message-time">{{ formatMessageTime(message.createTime) }}</span>
                <span class="read-status" v-if="message.senderId === currentUserId">
                  {{ message.status === 1 ? '已读' : '未读' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 输入区域 -->
    <footer class="chat-footer">
      <div class="input-toolbar">
        <button class="toolbar-btn" @click="toggleEmoji">
          <span class="emoji-icon">😊</span>
        </button>
        <button class="toolbar-btn" @click="selectImage">
          <span class="image-icon">📷</span>
        </button>
      </div>

      <!-- 表情选择器 -->
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-grid">
          <span 
            v-for="emoji in emojis" 
            :key="emoji"
            class="emoji-item"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>

      <div class="input-area">
        <textarea
          ref="messageInput"
          v-model="inputMessage"
          placeholder="输入消息..."
          rows="1"
          @input="autoResize"
          @keydown.enter.prevent="sendMessage"
        ></textarea>
        <button 
          class="send-btn" 
          :disabled="!inputMessage.trim() || sending"
          @click="sendMessage"
        >
          <span v-if="sending">发送中...</span>
          <span v-else>发送</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import { getChatHistoryApi, sendMessageToUserApi, markMessageAsReadApi } from '@/api/message'
import { getUserProfileApi, getUserByIdApi } from '@/api/user'

export default {
  name: 'ChatPage',
  data() {
    return {
      messages: [],
      inputMessage: '',
      loading: false,
      loadingMore: false,
      sending: false,
      hasMoreMessages: false,
      currentUser: null,
      currentUserId: null,
      chatPartnerId: null,
      chatPartnerName: '房东',
      chatPartnerAvatar: '',
      isOnline: false,
      showEmojiPicker: false,
      emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏'],
      refreshTimer: null,
      userCache: {}, // 缓存用户信息
      propertyId: null,
      fromProperty: false // 标记是否从房源详情页面进入
    }
  },
  async created() {
    // 从路由参数获取聊天对象ID
    this.chatPartnerId = this.$route.params.userId
    this.propertyId = this.$route.query.propertyId
    // 判断是否从房源详情页面进入
    this.fromProperty = !!this.propertyId
    
    // 获取当前用户信息
    await this.loadCurrentUser()
    
    // 获取聊天对象信息
    await this.loadChatPartnerInfo()
    
    // 加载聊天历史
    await this.loadChatHistory()
    
    // 启动定时刷新
    this.startAutoRefresh()
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  methods: {
    async loadCurrentUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        this.currentUserId = userInfo.userId
        
        // 获取完整用户信息
        const res = await getUserProfileApi()
        if (res.data && res.data.code === 200) {
          this.currentUser = res.data.data
          this.currentUserId = res.data.data.id
        }
      } catch (e) {
        console.error('获取当前用户信息失败:', e)
      }
    },
    async loadChatPartnerInfo() {
      try {
        // 调用API获取聊天对象信息
        const res = await getUserByIdApi(this.chatPartnerId)
        if (res.data && res.data.code === 200) {
          const user = res.data.data
          this.chatPartnerName = user.username || `用户 ${this.chatPartnerId}`
          this.chatPartnerAvatar = user.avatar || ''
        } else {
          // 如果获取失败，使用默认值
          this.chatPartnerName = `用户 ${this.chatPartnerId}`
          this.chatPartnerAvatar = ''
        }
      } catch (e) {
        console.error('获取聊天对象信息失败:', e)
        // 使用默认值
        this.chatPartnerName = `用户 ${this.chatPartnerId}`
        this.chatPartnerAvatar = ''
      }
    },
    async loadChatHistory() {
      this.loading = true
      try {
        const res = await getChatHistoryApi(this.chatPartnerId)
        if (res.data && res.data.code === 200) {
          this.messages = res.data.data || []
          
          // 标记对方发送的消息为已读
          this.messages.forEach(async (message) => {
            if (message.senderId !== this.currentUserId && message.status === 0) {
              try {
                await markMessageAsReadApi(message.id)
                message.status = 1
              } catch (e) {
                console.error('标记消息已读失败:', e)
              }
            }
          })
          
          // 滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (e) {
        console.error('加载聊天历史失败:', e)
      } finally {
        this.loading = false
      }
    },
    async sendMessage() {
      const content = this.inputMessage.trim()
      if (!content || this.sending) return
      
      this.sending = true
      try {
        // 将receiverId转换为数字类型
        const receiverId = Number(this.chatPartnerId)
        // 将propertyId转换为数字类型（如果存在）
        const propertyId = this.propertyId ? Number(this.propertyId) : null
        const res = await sendMessageToUserApi(receiverId, content, propertyId)
        if (res.data && res.data.code === 200) {
          // 添加消息到列表
          this.messages.push(res.data.data)
          this.inputMessage = ''
          
          // 滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }
      } catch (e) {
        console.error('发送消息失败:', e)
        alert('发送消息失败，请重试')
      } finally {
        this.sending = false
      }
    },
    async loadMoreMessages() {
      // TODO: 实现加载更多消息
      console.log('加载更多消息')
    },
    scrollToBottom() {
      const chatContent = this.$refs.chatContent
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight
      }
    },
    startAutoRefresh() {
      // 每5秒刷新一次消息
      this.refreshTimer = setInterval(() => {
        this.refreshMessages()
      }, 5000)
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    async refreshMessages() {
      try {
        const res = await getChatHistoryApi(this.chatPartnerId)
        if (res.data && res.data.code === 200) {
          const newMessages = res.data.data || []
          
          // 获取当前消息的最大ID
          const currentMaxId = this.messages.length > 0 
            ? Math.max(...this.messages.map(m => m.id)) 
            : 0
          
          // 过滤出新消息（ID大于当前最大ID的消息）
          const trulyNewMessages = newMessages.filter(m => m.id > currentMaxId)
          
          // 只添加新消息，而不是替换整个数组
          if (trulyNewMessages.length > 0) {
            this.messages.push(...trulyNewMessages)
            
            // 标记新消息为已读
            trulyNewMessages.forEach(async (message) => {
              if (message.senderId !== this.currentUserId && message.status === 0) {
                try {
                  await markMessageAsReadApi(message.id)
                  message.status = 1
                } catch (e) {
                  console.error('标记消息已读失败:', e)
                }
              }
            })
            
            // 滚动到底部
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          }
        }
      } catch (e) {
        console.error('刷新消息失败:', e)
      }
    },
    autoResize() {
      const textarea = this.$refs.messageInput
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
      }
    },
    goBack() {
      // 返回上一页
      this.$router.back()
    },
    showMoreOptions() {
      // 显示更多选项菜单
      console.log('显示更多选项')
    },
    toggleEmoji() {
      this.showEmojiPicker = !this.showEmojiPicker
    },
    insertEmoji(emoji) {
      this.inputMessage += emoji
      this.showEmojiPicker = false
      this.$refs.messageInput.focus()
    },
    selectImage() {
      // 选择图片功能
      console.log('选择图片')
    },
    getAvatar(userId) {
      // 返回用户头像URL
      const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId
      if (userId === this.currentUserId) {
        return this.currentUser?.avatar || defaultAvatar
      }
      return this.chatPartnerAvatar || defaultAvatar
    },
    getUserName(userId) {
      if (userId === this.currentUserId) {
        return '我'
      }
      return this.chatPartnerName
    },
    handleAvatarError(e) {
      // 使用在线默认头像服务
      const userId = e.target.alt || 'default'
      e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userId
    },
    showTimeDivider(message, index) {
      if (index === 0) return true
      
      const prevMessage = this.messages[index - 1]
      const currentTime = new Date(message.createTime).getTime()
      const prevTime = new Date(prevMessage.createTime).getTime()
      
      // 如果两条消息间隔超过5分钟，显示时间分割线
      return currentTime - prevTime > 5 * 60 * 1000
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      // 如果是今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      // 如果是昨天
      if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      // 其他情况显示完整日期
      return date.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    formatMessageTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* 聊天头部 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #07c160;
  font-size: 16px;
}

.back-icon {
  font-size: 24px;
  font-weight: 300;
}

.back-text {
  font-size: 16px;
}

.chat-title {
  flex: 1;
  text-align: center;
}

.chat-title h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #000000;
}

.online-status {
  font-size: 12px;
  color: #07c160;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  color: #000000;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-chat p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.empty-subtitle {
  font-size: 14px !important;
  color: #999 !important;
  margin-top: 8px !important;
}

.load-more {
  text-align: center;
  padding: 16px;
}

.load-more button {
  background: none;
  border: 1px solid #e5e5e5;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.load-more button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 消息项 */
.message-item {
  margin-bottom: 16px;
}

.time-divider {
  text-align: center;
  margin: 16px 0;
  color: #999;
  font-size: 12px;
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.self-message .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 4px;
  background: #ffffff;
  word-wrap: break-word;
}

.self-message .message-bubble {
  background: #95ec69;
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  color: #000000;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: #999;
}

.read-status {
  font-size: 11px;
  color: #999;
}

/* 输入区域 */
.chat-footer {
  background: #f7f7f7;
  border-top: 1px solid #e5e5e5;
  padding: 8px 16px;
}

.input-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.toolbar-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  padding: 4px;
}

.emoji-picker {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: #f0f0f0;
}

.input-area {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-area textarea {
  flex: 1;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 15px;
  resize: none;
  outline: none;
  max-height: 120px;
  background: #ffffff;
}

.input-area textarea:focus {
  border-color: #07c160;
}

.send-btn {
  background: #07c160;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.send-btn:hover:not(:disabled) {
  background: #06ad56;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-header {
    padding: 8px 12px;
  }
  
  .chat-content {
    padding: 12px;
  }
  
  .message-bubble {
    max-width: 80%;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>