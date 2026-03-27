<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🏠</span>
          <span class="logo-text">民宿管理平台</span>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn" @click="goToMessages" title="消息">
          <span class="icon">💬</span>
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
        <button class="icon-btn" @click="goToNotifications" title="通知">
          <span class="icon">🔔</span>
          <span v-if="notificationCount > 0" class="badge">{{ notificationCount > 99 ? '99+' : notificationCount }}</span>
        </button>
        <div class="user-info">
          <span class="role-badge">管理员</span>
          <button class="profile-btn" @click="goToProfile">
            <span class="avatar">👤</span>
            <span class="username">个人中心</span>
          </button>
        </div>
      </div>
    </header>

    <div class="main-container">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <nav class="menu">
          <div class="menu-section">
            <h3 class="menu-title">审核管理</h3>
            <ul class="menu-list">
              <li class="menu-item" :class="{ active: currentMenu === 'property-review' }" @click="goToPropertyReview">
                <span class="menu-icon">📝</span>
                <span class="menu-text">房源审核</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'refund-review' }" @click="goToRefundReview">
                <span class="menu-icon">💰</span>
                <span class="menu-text">退款审核</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'complaint-review' }" @click="goToComplaintReview">
                <span class="menu-icon">⚠️</span>
                <span class="menu-text">投诉审核</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'community-audit' }" @click="goToCommunityAudit">
                <span class="menu-icon">💬</span>
                <span class="menu-text">社区审核</span>
              </li>
            </ul>
          </div>

          <div class="menu-section">
            <h3 class="menu-title">数据管理</h3>
            <ul class="menu-list">
              <li class="menu-item" :class="{ active: currentMenu === 'user-manage' }" @click="goToUserManage">
                <span class="menu-icon">👤</span>
                <span class="menu-text">用户管理</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'property-manage' }" @click="goToPropertyManage">
                <span class="menu-icon">🏠</span>
                <span class="menu-text">房源管理</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'booking-manage' }" @click="goToBookingManage">
                <span class="menu-icon">📅</span>
                <span class="menu-text">订单管理</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'review-manage' }" @click="goToReviewManage">
                <span class="menu-icon">⭐</span>
                <span class="menu-text">评价管理</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'data-export' }" @click="goToDataExport">
                <span class="menu-icon">📊</span>
                <span class="menu-text">数据导出</span>
              </li>
            </ul>
          </div>

          <div class="menu-section">
            <h3 class="menu-title">系统管理</h3>
            <ul class="menu-list">
              <li class="menu-item" :class="{ active: currentMenu === 'category-manage' }" @click="goToCategoryManage">
                <span class="menu-icon">🏷️</span>
                <span class="menu-text">分类管理</span>
              </li>
              <li class="menu-item" :class="{ active: currentMenu === 'question-category' }" @click="goToQuestionCategory">
                <span class="menu-icon">❓</span>
                <span class="menu-text">问题分类</span>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 概览卡片 -->
        <section class="overview-section">
          <h2 class="section-title">平台概览</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background: #e3f2fd; color: #1976d2;">👤</div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.userCount || 0 }}</span>
                <span class="stat-label">总用户数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: #f3e5f5; color: #7b1fa2;">🏠</div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.propertyCount || 0 }}</span>
                <span class="stat-label">房源总数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: #e8f5e9; color: #388e3c;">📅</div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.bookingCount || 0 }}</span>
                <span class="stat-label">订单总数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: #fff3e0; color: #f57c00;">💰</div>
              <div class="stat-info">
                <span class="stat-value">¥{{ formatMoney(stats.totalRevenue) }}</span>
                <span class="stat-label">总交易额</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 待办事项 -->
        <section class="todo-section">
          <h2 class="section-title">待办事项</h2>
          <div class="todo-grid">
            <div class="todo-card" @click="goToPropertyReview">
              <div class="todo-badge" v-if="stats.pendingProperties > 0">{{ stats.pendingProperties }}</div>
              <div class="todo-icon">📝</div>
              <div class="todo-title">待审核房源</div>
              <div class="todo-desc">有新发布的房源等待审核</div>
            </div>
            <div class="todo-card" @click="goToRefundReview">
              <div class="todo-badge" v-if="stats.pendingRefunds > 0">{{ stats.pendingRefunds }}</div>
              <div class="todo-icon">💰</div>
              <div class="todo-title">待处理退款</div>
              <div class="todo-desc">有退款申请需要处理</div>
            </div>
            <div class="todo-card" @click="goToComplaintReview">
              <div class="todo-badge" v-if="stats.pendingComplaints > 0">{{ stats.pendingComplaints }}</div>
              <div class="todo-icon">⚠️</div>
              <div class="todo-title">待处理投诉</div>
              <div class="todo-desc">有用户投诉需要处理</div>
            </div>
            <div class="todo-card" @click="goToCommunityAudit">
              <div class="todo-badge" v-if="stats.pendingQuestions > 0">{{ stats.pendingQuestions }}</div>
              <div class="todo-icon">💬</div>
              <div class="todo-title">待审核问答</div>
              <div class="todo-desc">有社区内容需要审核</div>
            </div>
          </div>
        </section>

        <!-- 快捷入口 -->
        <section class="quick-section">
          <h2 class="section-title">快捷入口</h2>
          <div class="quick-grid">
            <button class="quick-btn" @click="goToUserManage">
              <span class="quick-icon">👤</span>
              <span class="quick-text">用户管理</span>
            </button>
            <button class="quick-btn" @click="goToPropertyManage">
              <span class="quick-icon">🏠</span>
              <span class="quick-text">房源管理</span>
            </button>
            <button class="quick-btn" @click="goToBookingManage">
              <span class="quick-icon">📅</span>
              <span class="quick-text">订单管理</span>
            </button>
            <button class="quick-btn" @click="goToDataExport">
              <span class="quick-icon">📊</span>
              <span class="quick-text">数据导出</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      currentMenu: '',
      unreadCount: 0,
      notificationCount: 0,
      stats: {
        userCount: 0,
        propertyCount: 0,
        bookingCount: 0,
        totalRevenue: 0,
        pendingProperties: 0,
        pendingRefunds: 0,
        pendingComplaints: 0,
        pendingQuestions: 0
      }
    }
  },
  async created() {
    await Promise.all([
      this.fetchUnreadCount(),
      this.fetchNotificationCount(),
      this.fetchStats()
    ])
  },
  methods: {
    formatMoney(value) {
      if (!value) return '0.00'
      return Number(value).toFixed(2)
    },
    async fetchUnreadCount() {
      try {
        const { getChatSessionsApi } = await import('@/api/message')
        const res = await getChatSessionsApi()
        if (res.data && res.data.code === 200) {
          const sessions = res.data.data || []
          this.unreadCount = sessions.reduce((total, session) => total + (session.unreadCount || 0), 0)
        }
      } catch (e) {
        console.error('获取未读消息数量失败:', e)
      }
    },
    async fetchNotificationCount() {
      try {
        const { getUnreadCountApi } = await import('@/api/notification')
        const res = await getUnreadCountApi()
        if (res.data && res.data.code === 200) {
          this.notificationCount = res.data.data || 0
        }
      } catch (e) {
        console.error('获取未读通知数量失败:', e)
      }
    },
    async fetchStats() {
      // 这里可以调用后端接口获取统计数据
      // 暂时使用模拟数据
      this.stats = {
        userCount: 128,
        propertyCount: 56,
        bookingCount: 234,
        totalRevenue: 45680.50,
        pendingProperties: 3,
        pendingRefunds: 2,
        pendingComplaints: 1,
        pendingQuestions: 5
      }
    },
    goToMessages() {
      this.$router.push('/messages')
    },
    goToNotifications() {
      this.$router.push('/notifications')
    },
    goToProfile() {
      this.$router.push('/profile')
    },
    goToPropertyReview() {
      this.currentMenu = 'property-review'
      this.$router.push('/admin/properties/review')
    },
    goToRefundReview() {
      this.currentMenu = 'refund-review'
      this.$router.push('/admin/refunds/review')
    },
    goToComplaintReview() {
      this.currentMenu = 'complaint-review'
      this.$router.push('/admin/complaints/review')
    },
    goToCommunityAudit() {
      this.currentMenu = 'community-audit'
      this.$router.push('/admin/community/audit')
    },
    goToUserManage() {
      this.currentMenu = 'user-manage'
      this.$router.push('/admin/data/users')
    },
    goToPropertyManage() {
      this.currentMenu = 'property-manage'
      this.$router.push('/admin/data/properties')
    },
    goToBookingManage() {
      this.currentMenu = 'booking-manage'
      this.$router.push('/admin/data/bookings')
    },
    goToReviewManage() {
      this.currentMenu = 'review-manage'
      this.$router.push('/admin/data/reviews')
    },
    goToDataExport() {
      this.currentMenu = 'data-export'
      this.$router.push('/admin/data/export')
    },
    goToCategoryManage() {
      this.currentMenu = 'category-manage'
      alert('分类管理功能开发中')
    },
    goToQuestionCategory() {
      this.currentMenu = 'question-category'
      this.$router.push('/admin/community/categories')
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f0f0f0;
}

.icon {
  font-size: 20px;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  background: #ff4d4f;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-badge {
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid #91d5ff;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 4px 12px 4px 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-btn:hover {
  border-color: #1890ff;
  background: #f0f7ff;
}

.avatar {
  width: 28px;
  height: 28px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.username {
  font-size: 13px;
  color: #333;
}

/* 主容器 */
.main-container {
  display: flex;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  padding: 16px 0;
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  overflow-y: auto;
}

.menu-section {
  margin-bottom: 8px;
}

.menu-title {
  padding: 8px 24px;
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #1890ff;
}

.menu-item.active {
  background: #e6f7ff;
  color: #1890ff;
  border-left-color: #1890ff;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 14px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

/* 概览统计 */
.overview-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

/* 待办事项 */
.todo-section {
  margin-bottom: 32px;
}

.todo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.todo-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  position: relative;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.todo-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  min-width: 20px;
  height: 20px;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.todo-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.todo-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.todo-desc {
  font-size: 13px;
  color: #999;
}

/* 快捷入口 */
.quick-section {
  margin-bottom: 32px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #1890ff;
  background: #f0f7ff;
  transform: translateY(-2px);
}

.quick-icon {
  font-size: 32px;
}

.quick-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid,
  .todo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
  }

  .stats-grid,
  .todo-grid,
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
