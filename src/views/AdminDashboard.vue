<template>
  <div class="admin-dashboard">
    <header class="header">
      <div>
        <h1>管理员控制台</h1>
        <p class="subtitle">进行房源审核、分类管理和平台运行监控</p>
      </div>
      <button class="btn btn-outline" @click="backHome">返回前台首页</button>
    </header>

    <main class="main">
      <section class="grid">
        <div class="card" @click="reviewProperties">
          <h2>📝 审核房源与修改</h2>
          <p>查看新发布房源和房东修改申请，进行审核通过或驳回。</p>
        </div>
        <div class="card" @click="manageCategories">
          <h2>🏷 管理房源分类</h2>
          <p>维护房源分类和标签，便于前端展示与搜索过滤。</p>
        </div>
        <div class="card" @click="manageUsers">
          <h2>👤 用户与角色管理</h2>
          <p>查看用户列表，对异常账号进行禁用或调整角色。</p>
        </div>
        <div class="card" @click="viewStats">
          <h2>📊 平台数据分析</h2>
          <p>后续可接入收入统计、订单量、热门房源等数据报表。</p>
        </div>
      </section>

      <section class="info">
        <h3>说明</h3>
        <ul>
          <li>当前实现的是管理员首页界面布局和导航入口，具体功能会随着后端接口开发逐步完善。</li>
          <li>只有 <strong>管理员</strong> 角色可以访问本页面，其它角色访问时会被路由守卫重定向。</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboardPage',
  methods: {
    backHome() {
      this.$router.push('/')
    },
    reviewProperties() {
      alert('这里将来跳转到“房源审核列表”页面')
    },
    manageCategories() {
      alert('这里将来跳转到“房源分类管理”页面')
    },
    manageUsers() {
      alert('这里将来跳转到“用户与角色管理”页面')
    },
    viewStats() {
      alert('这里将来跳转到“平台数据分析报表”页面')
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f3f4f6;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #111827;
  color: #f9fafb;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #d1d5db;
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
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
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
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
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
  border: 1px solid #e5e7eb;
  background: transparent;
  color: #f9fafb;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #e5e7eb;
  color: #111827;
}
</style>





