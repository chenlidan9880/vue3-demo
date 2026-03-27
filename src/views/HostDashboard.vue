<template>
  <div class="host-dashboard">
    <header class="header">
      <div>
        <h1>房东控制台</h1>
        <p class="subtitle">管理你的房源、价格和预订情况</p>
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

    <main class="main">
      <section class="grid">
        <div class="card" @click="createProperty">
          <h2>➕ 发布新房源</h2>
          <p>录入房源基本信息，上传图片和视频链接。</p>
        </div>
        <div class="card" @click="manageProperties">
          <h2>📂 管理房源列表</h2>
          <p>查看和编辑已发布的房源，上架/下架房源。</p>
        </div>
        <div class="card" @click="managePricing">
          <h2>💰 管理价格策略</h2>
          <p>设置平日价、节假日价和旺季价格。</p>
        </div>
        <div class="card" @click="viewBookings">
          <h2>📅 查看预订情况</h2>
          <p>查看每个房源的预约/订单和入住时间。</p>
        </div>
        <div class="card" @click="goToCommunity">
          <h2>💬 社区问答</h2>
          <p>与其他用户交流，分享民宿经营经验和解答问题。</p>
        </div>
        <div class="card" @click="goToMessages">
          <h2>💬 在线聊天</h2>
          <p>与租客进行实时沟通，解答疑问和处理预订相关问题。</p>
          <span v-if="unreadCount > 0" class="unread-indicator">{{ unreadCount }} 条未读</span>
        </div>
        <div class="card" @click="goToNotifications">
          <h2>🔔 消息通知</h2>
          <p>查看预约申请、订单状态、退款申请等系统通知。</p>
          <span v-if="notificationCount > 0" class="unread-indicator">{{ notificationCount }} 条未读</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HostDashboardPage',
  data() {
    return {
      notificationCount: 0,
      unreadCount: 0
    }
  },
  computed: {
    roleText() {
      return '房东'
    }
  },
  async created() {
    await this.fetchNotificationCount()
    await this.fetchUnreadCount()
  },
  methods: {

    createProperty() {
      this.$router.push('/host/properties/new')
    },
    manageProperties() {
      this.$router.push('/host/properties')
    },
    managePricing() {
      this.$router.push('/host/properties')
    },
    viewBookings() {
      this.$router.push('/host/bookings')
    },
    goToCommunity() {
      this.$router.push('/community')
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
.host-dashboard {
  min-height: 100vh;
  background: #f7f8fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-tag {
  font-size: 14px;
  color: #666;
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
  margin-right: 12px;
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

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.main {
  padding: 24px 40px 40px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background: #ffffff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.card h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.card p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}

.info {
  background: #ffffff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  max-width: 600px;
}

.info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #111827;
}

.info ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #4b5563;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #42b983;
  background: transparent;
  color: #42b983;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #42b983;
  color: #ffffff;
}
</style>


