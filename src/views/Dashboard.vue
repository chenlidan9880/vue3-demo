<template>
  <div class="dashboard-page">
    <!-- 顶部欢迎区 -->
    <header class="dashboard-header">
      <div class="title-block">
        <h1>民宿预约系统</h1>
        <p class="subtitle">欢迎回来，{{ userInfo.username || '用户' }}</p>
      </div>
      <div class="user-actions">
        <button class="message-btn" @click="goToMessages" title="在线聊天">
          <span class="message-icon">💬</span>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
        <button class="message-btn" @click="goToNotifications" title="通知中心">
          <span class="message-icon">🔔</span>
          <span v-if="notificationCount > 0" class="unread-badge">{{ notificationCount > 99 ? '99+' : notificationCount }}</span>
        </button>
        <span class="role-tag">当前角色：{{ roleText }}</span>
        <button class="profile-btn" @click="goToProfile">
          <span class="profile-icon">👤</span>
          <span class="profile-text">个人中心</span>
        </button>
      </div>
    </header>

    <!-- 主体功能区 -->
    <main class="dashboard-main">
      <section class="card-grid">
        <div class="card" @click="goTo('search')">
          <h2>🔍 浏览与搜索房源</h2>
          <p>根据城市、价格、房型等条件快速查找合适的民宿。</p>
        </div>
        <div class="card" @click="goTo('orders')">
          <h2>📅 我的订单</h2>
          <p>查看和管理你的预约订单，支持取消与查看详情。</p>
        </div>
        <div class="card" v-if="userInfo.userType === 1" @click="goTo('myComplaints')">
          <h2>⚠️ 我的投诉</h2>
          <p>查看我的投诉记录和处理结果。</p>
        </div>
        <div class="card" @click="goTo('community')">
          <h2>💬 社区问答</h2>
          <p>与其他用户交流，分享民宿入住经验和旅行心得。</p>
        </div>
        <div class="card" @click="goToMessages">
          <h2>💬 在线聊天</h2>
          <p>与不同房源的客服进行实时沟通，解答您的疑问。</p>
          <span v-if="unreadCount > 0" class="unread-indicator">{{ unreadCount }} 条未读</span>
        </div>
        <div class="card" @click="goToNotifications">
          <h2>🔔 消息通知</h2>
          <p>查看系统通知、订单状态、退款进度等重要消息。</p>
          <span v-if="notificationCount > 0" class="unread-indicator">{{ notificationCount }} 条未读</span>
        </div>
        <div class="card" v-if="userInfo.userType === 2" @click="goTo('hostProperties')">
          <h2>🏠 房东房源管理</h2>
          <p>发布新的民宿房源，管理现有房源的价格与状态。</p>
        </div>
        <div class="card" v-if="userInfo.userType === 3" @click="goTo('admin')">
          <h2>🛠 管理员控制台</h2>
          <p>审核房源、管理用户与订单，查看平台统计数据。</p>
        </div>
      </section>


    </main>
  </div>
</template>

<script>
export default {
  name: 'DashboardPage',
  data() {
    return {
      userInfo: {},
      loading: true,
      error: null,
      notificationCount: 0,
      unreadCount: 0
    }
  },
  computed: {
    roleText() {
      const type = this.userInfo.userType
      if (type === 1) return '租客'
      if (type === 2) return '房东'
      if (type === 3) return '管理员'
      return '普通用户'
    }
  },
  async created() {
    await this.fetchCurrentUser()
    await this.fetchNotificationCount()
    await this.fetchUnreadCount()
  },
  methods: {
    async fetchCurrentUser() {
      this.loading = true
      this.error = null
      try {
        const { getCurrentUserApi } = await import('@/api/auth')
        const res = await getCurrentUserApi()
        if (res.data && res.data.code === 200 && res.data.data) {
          this.userInfo = res.data.data
          // 同步刷新本地缓存，便于其他页面复用
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        } else {
          this.error = res.data?.message || '获取用户信息失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取用户信息失败'
      } finally {
        this.loading = false
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      this.$router.push('/login')
    },
    goTo(type) {
      if (type === 'search') {
        this.$router.push('/properties')
      } else if (type === 'orders') {
        this.$router.push('/bookings')
      } else if (type === 'myComplaints') {
        this.$router.push('/my-complaints')
      } else if (type === 'community') {
        this.$router.push('/community')
      } else if (type === 'hostProperties') {
        this.$router.push('/host/properties')
      } else if (type === 'admin') {
        this.$router.push('/admin')
      }
    },
    goToProfile() {
      this.$router.push('/profile')
    },
    goToMessages() {
      this.$router.push('/messages')
    },
    goToNotifications() {
      this.$router.push('/notifications')
    },
    async fetchNotificationCount() {
      try {
        const request = await import('@/api/request')
        const res = await request.default.get('/api/notifications/unread-count')
        if (res.data && res.data.code === 200) {
          this.notificationCount = res.data.data.total || 0
        }
      } catch (e) {
        console.error('获取未读通知数量失败:', e)
      }
    },
    async fetchUnreadCount() {
      try {
        const request = await import('@/api/request')
        const res = await request.default.get('/api/messages/unread-count')
        if (res.data && res.data.code === 200) {
          this.unreadCount = res.data.data || 0
        }
      } catch (e) {
        console.error('获取未读消息数量失败:', e)
      }
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.title-block h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.subtitle {
  margin: 4px 0 0;
  color: #888;
  font-size: 14px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.message-btn:hover {
  transform: scale(1.1);
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  box-shadow: 0 2px 4px rgba(255, 77, 79, 0.3);
}

.role-tag {
  font-size: 14px;
  color: #666;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #666;
}

.profile-btn:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.profile-icon {
  font-size: 16px;
}

.profile-text {
  font-weight: 400;
}

.unread-indicator {
  display: inline-block;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 8px;
  font-weight: 500;
}

.dashboard-main {
  flex: 1;
  padding: 24px 40px 40px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card h2 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #2c3e50;
}

.card p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-block;
  border: none;
  cursor: pointer;
}

.btn-outline {
  background-color: transparent;
  color: #42b983;
  border: 1px solid #42b983;
}

.btn-outline:hover {
  background-color: #42b983;
  color: #fff;
}

.btn-primary {
  background-color: #42b983;
  color: #fff;
  width: 100%;
}

.btn-primary:hover {
  background-color: #35a372;
}
</style>



