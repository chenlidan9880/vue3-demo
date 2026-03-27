<template>
  <div class="message-list-page">
    <header class="header">
      <h1 class="title">消息</h1>
      <button class="more-btn" @click="showMoreOptions">
        <span class="more-icon">+</span>
      </button>
    </header>

    <main class="content">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索消息"
          />
        </div>
      </div>

      <!-- 会话列表 -->
      <div class="session-list" v-if="loading">
        <div class="loading">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
      </div>

      <div class="session-list" v-else-if="filteredSessions.length === 0">
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <p class="empty-title">暂无消息</p>
          <p class="empty-subtitle">开始和房东聊天吧</p>
        </div>
      </div>

      <div class="session-list" v-else>
        <div 
          v-for="session in filteredSessions" 
          :key="session.userId"
          class="session-item"
          @click="enterChat(session)"
        >
          <!-- 头像 -->
          <div class="avatar-wrapper">
            <img 
              :src="getAvatar(session)" 
              :alt="session.userName"
              class="avatar"
            />
            <div class="unread-badge" v-if="session.unreadCount > 0">
              {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
            </div>
          </div>

          <!-- 会话信息 -->
          <div class="session-info">
            <div class="session-header">
              <span class="user-name">{{ session.userName || '用户' + session.userId }}</span>
              <span class="message-time">{{ formatTime(session.lastMessageTime) }}</span>
            </div>
            <div class="session-body">
              <p class="last-message">{{ session.lastMessage || '暂无消息' }}</p>
              <span class="property-tag" v-if="session.propertyTitle">
                {{ session.propertyTitle }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getChatSessionsApi } from '@/api/message'

export default {
  name: 'MessageListPage',
  data() {
    return {
      sessions: [],
      searchKeyword: '',
      loading: false,
      refreshTimer: null,
      currentUser: null
    }
  },
  computed: {
    filteredSessions() {
      if (!this.searchKeyword.trim()) {
        return this.sessions
      }
      const keyword = this.searchKeyword.toLowerCase()
      return this.sessions.filter(session => {
        const userName = (session.userName || '').toLowerCase()
        const messageContent = (session.messageContent || '').toLowerCase()
        const propertyTitle = (session.propertyTitle || '').toLowerCase()
        return userName.includes(keyword) || 
               messageContent.includes(keyword) || 
               propertyTitle.includes(keyword)
      })
    }
  },
  async mounted() {
    // 获取当前用户信息
    this.getCurrentUser()
    await this.loadSessions()
    // 启动定时刷新
    this.startAutoRefresh()
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  methods: {
    getCurrentUser() {
      try {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          this.currentUser = JSON.parse(userInfo)
        }
      } catch (e) {
        console.error('获取当前用户信息失败:', e)
      }
    },
    async loadSessions() {
      this.loading = true
      try {
        const res = await getChatSessionsApi()
        if (res.data && res.data.code === 200) {
          this.sessions = res.data.data || []
        }
      } catch (e) {
        console.error('加载会话列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    startAutoRefresh() {
      // 每30秒刷新一次会话列表
      this.refreshTimer = setInterval(() => {
        this.refreshSessions()
      }, 30000)
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    async refreshSessions() {
      try {
        const res = await getChatSessionsApi()
        if (res.data && res.data.code === 200) {
          const newSessions = res.data.data || []
          this.updateSessions(newSessions)
        }
      } catch (e) {
        console.error('刷新会话列表失败:', e)
      }
    },
    updateSessions(newSessions) {
      // 保持会话列表的稳定性，只更新变化的数据
      const existingIds = new Set(this.sessions.map(s => s.userId))
      
      // 添加新会话
      newSessions.forEach(newSession => {
        if (!existingIds.has(newSession.userId)) {
          this.sessions.push(newSession)
        } else {
          // 更新现有会话
          const existingSession = this.sessions.find(s => s.userId === newSession.userId)
          if (existingSession) {
            Object.assign(existingSession, newSession)
          }
        }
      })
      
      // 按最后消息时间排序
      this.sessions.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || 0).getTime()
        const timeB = new Date(b.lastMessageTime || 0).getTime()
        return timeB - timeA
      })
    },
    enterChat(session) {
      this.$router.push({
        path: `/chat/${session.userId}`,
        query: {
          propertyId: session.propertyId,
          userName: session.userName
        }
      })
    },
    showMoreOptions() {
      // 显示更多选项菜单
      console.log('显示更多选项')
    },
    getAvatar(session) {
      // 显示对方的头像
      if (session.userAvatar) {
        return session.userAvatar
      }
      // 如果对方没有头像，使用系统默认头像
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.userId}`
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      // 如果是今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      // 如果是昨天
      if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
        return '昨天'
      }
      
      // 如果是本周
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = ['日', '一', '二', '三', '四', '五', '六']
        return '星期' + days[date.getDay()]
      }
      
      // 其他情况显示日期
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    }
  }
}
</script>

<style scoped>
.message-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f8f8;
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.more-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.more-btn:hover {
  background: #f0f0f0;
}

.more-icon {
  font-size: 24px;
  color: #333;
  font-weight: 300;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

/* 内容区域 */
.content {
  flex: 1;
  overflow-y: auto;
}

/* 搜索栏 */
.search-bar {
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 8px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 16px;
  color: #999;
  margin-right: 8px;
}

.search-input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
}

.search-input-wrapper input::placeholder {
  color: #999;
}

/* 会话列表 */
.session-list {
  background: #ffffff;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #07c160;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  text-align: center;
  background: #fafafa;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 500;
}

.empty-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 会话项 */
.session-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.session-item:hover {
  background: #f9f9f9;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  background: #ff4d4f;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(255, 77, 79, 0.3);
}

/* 会话信息 */
.session-info {
  flex: 1;
  min-width: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.message-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-left: 12px;
}

.session-body {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 20px;
}

.last-message {
  flex: 1;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  line-height: 1.4;
}

.property-tag {
  font-size: 12px;
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid rgba(7, 193, 96, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .title {
    font-size: 16px;
  }

  .search-bar {
    padding: 8px 16px;
    top: 48px;
  }

  .session-item {
    padding: 14px 16px;
  }

  .avatar {
    width: 48px;
    height: 48px;
  }

  .user-name {
    font-size: 15px;
  }

  .last-message {
    font-size: 13px;
  }

  .empty-state {
    padding: 100px 20px;
  }
}
</style>