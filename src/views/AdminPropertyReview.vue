<template>
  <div class="admin-property-review">
    <header class="header">
      <h1 class="title">房源审核</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="properties.length === 0" class="empty">暂无待审核的房源</div>
      
      <div v-else class="property-list">
        <div 
          v-for="property in properties" 
          :key="property.id"
          class="property-card"
        >
          <div class="property-header">
            <h2>{{ property.title }}</h2>
            <span class="property-status status-pending">待审核</span>
          </div>
          
          <div class="property-info">
            <div class="info-item">
              <span class="label">房东：</span>
              <span>{{ property.ownerId }}</span>
            </div>
            <div class="info-item">
              <span class="label">城市：</span>
              <span>{{ property.city }} {{ property.district }}</span>
            </div>
            <div class="info-item">
              <span class="label">类型：</span>
              <span>{{ getPropertyTypeText(property.propertyType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">户型：</span>
              <span>{{ getRoomTypeText(property.roomType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">价格：</span>
              <span class="price">￥{{ property.pricePerNight }}/晚</span>
            </div>
            <div class="info-item">
              <span class="label">面积：</span>
              <span>{{ property.area }}㎡</span>
            </div>
            <div class="info-item">
              <span class="label">最大入住：</span>
              <span>{{ property.maxGuests }}人</span>
            </div>
            <div class="info-item">
              <span class="label">地址：</span>
              <span>{{ property.address }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span>{{ formatDate(property.createdAt) }}</span>
            </div>
          </div>
          
          <div class="property-actions">
            <button 
              class="btn btn-primary" 
              @click="verifyProperty(property.id, true)"
              :disabled="processing.includes(property.id)"
            >
              {{ processing.includes(property.id) ? '处理中...' : '审核通过' }}
            </button>
            <button 
              class="btn btn-outline" 
              @click="verifyProperty(property.id, false)"
              :disabled="processing.includes(property.id)"
            >
              {{ processing.includes(property.id) ? '处理中...' : '审核驳回' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'AdminPropertyReviewPage',
  data() {
    return {
      properties: [],
      loading: false,
      error: null,
      processing: []
    }
  },
  async created() {
    await this.fetchProperties()
  },
  methods: {
    async fetchProperties() {
      this.loading = true
      this.error = null
      try {
        const res = await request.get('/api/admin/properties/unverified')
        if (res.data && res.data.code === 200) {
          this.properties = res.data.data || []
        } else {
          this.error = res.data?.message || '获取待审核房源失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取待审核房源失败'
      } finally {
        this.loading = false
      }
    },
    async verifyProperty(propertyId, isVerified) {
      this.processing.push(propertyId)
      try {
        const verifyStatus = isVerified ? 1 : 2
        const res = await request.post(`/api/admin/properties/${propertyId}/verify?isVerified=${verifyStatus}`)
        if (res.data && res.data.code === 200) {
          alert(isVerified ? '房源审核通过' : '房源审核驳回')
          await this.fetchProperties()
        } else {
          alert(res.data?.message || '审核操作失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '审核操作失败')
      } finally {
        this.processing = this.processing.filter(id => id !== propertyId)
      }
    },
    getPropertyTypeText(type) {
      const types = { 1: '整租', 2: '合租', 3: '单间' }
      return types[type] || '未知'
    },
    getRoomTypeText(type) {
      const types = { 1: '一居室', 2: '二居室', 3: '三居室', 4: '四居室及以上' }
      return types[type] || '未知'
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    goBack() {
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.admin-property-review {
  min-height: 100vh;
  background: #f3f4f6;
}

.header {
  display: flex;
  align-items: center;
  padding: 20px 40px;
  background: #111827;
  color: #f9fafb;
}

.header .btn {
  margin-right: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
}

.content {
  padding: 24px 40px 40px;
}

.loading, .error, .empty {
  background: #ffffff;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  max-width: 600px;
  margin: 0 auto;
}

.property-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.property-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.property-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.property-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
  flex: 1;
}

.property-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #e5e7eb;
  color: #4b5563;
}

.property-info {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-item span:not(.label) {
  font-size: 14px;
  color: #374151;
}

.price {
  font-weight: 600;
  color: #ef4444;
}

.property-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #111827;
  color: #f9fafb;
  border-color: #111827;
}

.btn-primary:hover {
  background: #1f2937;
}

.btn-outline {
  background: transparent;
  color: #374151;
}

.btn-outline:hover {
  background: #f3f4f6;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
  
  .property-info {
    grid-template-columns: 1fr;
  }
  
  .property-actions {
    flex-direction: column;
  }
}
</style>