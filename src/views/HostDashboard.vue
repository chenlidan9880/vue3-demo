<template>
  <div class="host-dashboard">
    <header class="header">
      <div>
        <h1>房东控制台</h1>
        <p class="subtitle">管理你的房源、价格和预订情况</p>
      </div>
      <button class="btn btn-outline" @click="backHome">返回前台首页</button>
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
      </section>

      <section class="info">
        <h3>温馨提示</h3>
        <ul>
          <li>当前仅实现房东控制台界面，具体“发布房源、管理房源、价格策略”等功能会在后续任务中逐步接入后端接口。</li>
          <li>你的账号类型为 <strong>房东</strong>，租客和游客不会看到本页面。</li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HostDashboardPage',
  methods: {
    backHome() {
      this.$router.push('/')
    },
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
      alert('这里将来跳转到“房东查看预订/订单列表”页面')
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


