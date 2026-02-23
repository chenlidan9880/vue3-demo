<template>
  <div class="host-property-list">
    <header class="header">
      <div>
        <h1>我的房源</h1>
        <p class="subtitle">查看并管理你发布的所有房源</p>
      </div>
      <button class="btn btn-primary" @click="goCreate">发布新房源</button>
    </header>

    <main class="main">
      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="list.length === 0" class="state">你还没有发布任何房源，点击右上角按钮开始发布吧。</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>城市</th>
            <th>价格/晚</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.city }} / {{ item.district }}</td>
            <td>￥{{ item.pricePerNight }}</td>
            <td>
              <span :class="['status-tag', `status-${item.status}`]">
                {{ statusText(item.status) }}
              </span>
            </td>
            <td class="actions">
              <button class="link" @click="goEdit(item.id)">编辑</button>
              <button class="link" @click="openPricing(item)">设置价格</button>
              <button
                class="link"
                v-if="item.status !== 1"
                @click="publish(item.id)"
              >
                上架
              </button>
              <button
                class="link"
                v-else
                @click="unpublish(item.id)"
              >
                下架
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 简单价格设置弹窗 -->
      <div v-if="showPricing" class="dialog-mask">
        <div class="dialog">
          <h2>设置价格 - {{ pricingForm.title }}</h2>
          <div class="form-group">
            <label>每晚价格：</label>
            <input v-model.number="pricingForm.pricePerNight" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>清洁费：</label>
            <input v-model.number="pricingForm.cleaningFee" type="number" min="0" />
          </div>
          <div class="form-group">
            <label>押金：</label>
            <input v-model.number="pricingForm.securityDeposit" type="number" min="0" />
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="closePricing">取消</button>
            <button class="btn btn-primary" @click="savePricing">保存</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import {
  getMyPropertiesApi,
  publishPropertyApi,
  unpublishPropertyApi,
  updatePricingApi
} from '@/api/hostProperty'

export default {
  name: 'HostPropertyListPage',
  data() {
    return {
      list: [],
      loading: false,
      error: null,
      showPricing: false,
      pricingForm: {
        id: null,
        title: '',
        pricePerNight: 0,
        cleaningFee: 0,
        securityDeposit: 0
      }
    }
  },
  async created() {
    await this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        const res = await getMyPropertiesApi()
        if (res.data && res.data.code === 200) {
          this.list = res.data.data || []
        } else {
          this.error = res.data?.message || '加载房源列表失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '加载房源列表失败'
      } finally {
        this.loading = false
      }
    },
    statusText(status) {
      if (status === 1) return '已上架'
      if (status === 2) return '维护中'
      if (status === 3) return '已下架'
      return '未知'
    },
    goCreate() {
      this.$router.push('/host/properties/new')
    },
    goEdit(id) {
      this.$router.push(`/host/properties/${id}/edit`)
    },
    async publish(id) {
      if (!confirm('确认上架该房源？')) return
      try {
        await publishPropertyApi(id)
        await this.fetchList()
      } catch (e) {
        alert(e?.response?.data?.message || '上架失败')
      }
    },
    async unpublish(id) {
      if (!confirm('确认下架该房源？')) return
      try {
        await unpublishPropertyApi(id)
        await this.fetchList()
      } catch (e) {
        alert(e?.response?.data?.message || '下架失败')
      }
    },
    openPricing(item) {
      this.pricingForm = {
        id: item.id,
        title: item.title,
        pricePerNight: item.pricePerNight || 0,
        cleaningFee: item.cleaningFee || 0,
        securityDeposit: item.securityDeposit || 0
      }
      this.showPricing = true
    },
    closePricing() {
      this.showPricing = false
    },
    async savePricing() {
      try {
        await updatePricingApi(this.pricingForm.id, {
          pricePerNight: this.pricingForm.pricePerNight,
          cleaningFee: this.pricingForm.cleaningFee,
          securityDeposit: this.pricingForm.securityDeposit
        })
        this.showPricing = false
        await this.fetchList()
      } catch (e) {
        alert(e?.response?.data?.message || '保存价格失败')
      }
    }
  }
}
</script>

<style scoped>
.host-property-list {
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
  font-size: 22px;
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

.state {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
}

.state.error {
  color: #b91c1c;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.table th,
.table td {
  padding: 12px 14px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

.table th {
  background: #f9fafb;
  color: #4b5563;
}

.table tr:last-child td {
  border-bottom: none;
}

.status-tag {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.status-1 {
  background: #ecfdf3;
  color: #15803d;
}

.status-2 {
  background: #fef3c7;
  color: #92400e;
}

.status-3 {
  background: #fee2e2;
  color: #b91c1c;
}

.actions .link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
  margin-right: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #42b983;
  color: #ffffff;
}

.btn-primary:hover {
  background: #35a372;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  width: 360px;
  background: #ffffff;
  border-radius: 10px;
  padding: 20px 22px 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
}

.dialog h2 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #111827;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  color: #4b5563;
}

.form-group input {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.dialog-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}
</style>





