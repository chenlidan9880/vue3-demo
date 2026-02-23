<template>
  <div class="dashboard-page">
    <!-- 顶部欢迎区 -->
    <header class="dashboard-header">
      <div class="title-block">
        <h1>民宿预约系统</h1>
        <p class="subtitle">欢迎回来，{{ userInfo.username || '用户' }}</p>
      </div>
      <div class="user-actions">
        <span class="role-tag">当前角色：{{ roleText }}</span>
        <button class="btn btn-outline" @click="logout">退出登录</button>
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
        <div class="card" v-if="userInfo.userType === 2" @click="goTo('hostProperties')">
          <h2>🏠 房东房源管理</h2>
          <p>发布新的民宿房源，管理现有房源的价格与状态。</p>
        </div>
        <div class="card" v-if="userInfo.userType === 3" @click="goTo('admin')">
          <h2>🛠 管理员控制台</h2>
          <p>审核房源、管理用户与订单，查看平台统计数据。</p>
        </div>
      </section>

      <!-- 账户概览 -->
      <section class="status-section">
        <h3>账户概览</h3>
        <ul>
          <li>用户ID：{{ userInfo.userId || userInfo.id }}</li>
          <li>用户名：{{ userInfo.username }}</li>
          <li v-if="userInfo.email">邮箱：{{ userInfo.email }}</li>
          <li v-if="userInfo.phone">手机号：{{ userInfo.phone }}</li>
        </ul>
        <div class="profile-link">
          <button class="btn btn-primary" @click="goToProfile">进入个人中心</button>
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
      error: null
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
        alert('这里将来跳转到"我的订单"页面')
      } else if (type === 'hostProperties') {
        alert('这里将来跳转到"房东房源管理"页面')
      } else if (type === 'admin') {
        alert('这里将来跳转到"管理员控制台"页面')
      }
    },
    goToProfile() {
      this.$router.push('/profile')
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

.role-tag {
  font-size: 14px;
  color: #666;
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

.status-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  max-width: 420px;
}

.status-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #2c3e50;
}

.status-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-section li {
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
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

.profile-link {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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



