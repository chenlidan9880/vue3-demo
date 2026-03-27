<template>
  <div class="booking-form">
    <header class="header">
      <button class="btn btn-outline" @click="goBack">返回详情</button>
      <h1 class="title">预约房源</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!property" class="error">房源信息加载失败</div>
      
      <div v-else class="form-container">
        <!-- 房源信息 -->
        <div class="property-info">
          <h2 class="property-title">{{ property.title }}</h2>
          <div class="property-details">
            <span class="detail-item">
              <span class="icon">📍</span>
              {{ property.city }} · {{ property.district }}
            </span>
            <span class="detail-item">
              <span class="icon">🏠</span>
              {{ propertyTypeText(property.propertyType) }}
            </span>
            <span class="detail-item">
              <span class="icon">🛏️</span>
              {{ roomTypeText(property.roomType) }}
            </span>
          </div>
        </div>

        <!-- 预约表单 -->
        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-row">
            <label for="checkIn">入住日期 *</label>
            <input 
              id="checkIn" 
              v-model="form.checkIn" 
              type="date" 
              required 
              :min="minCheckInDate"
            />
          </div>

          <div class="form-row">
            <label for="checkOut">退房日期 *</label>
            <input 
              id="checkOut" 
              v-model="form.checkOut" 
              type="date" 
              required 
              :min="minCheckOutDate"
            />
          </div>

          <div class="form-row">
            <label for="guestCount">入住人数 *</label>
            <input 
              id="guestCount" 
              v-model.number="form.guestCount" 
              type="number" 
              min="1" 
              :max="property.maxGuests" 
              required 
            />
            <span class="hint">最多可住 {{ property.maxGuests }} 人</span>
          </div>

          <!-- 价格计算 -->
          <div class="price-section">
            <h3>价格明细</h3>
            <div class="price-item">
              <span>每晚价格</span>
              <span>￥{{ property.pricePerNight }}</span>
            </div>
            <div class="price-item">
              <span>入住天数</span>
              <span>{{ days }} 天</span>
            </div>
            <div class="price-item">
              <span>房费小计</span>
              <span>￥{{ roomSubtotal }}</span>
            </div>
            <div class="price-item">
              <span>清洁费</span>
              <span>￥{{ property.cleaningFee || 0 }}</span>
            </div>
            <div class="price-item">
              <span>押金</span>
              <span>￥{{ property.securityDeposit || 0 }}</span>
            </div>
            <div class="price-total">
              <span>总计</span>
              <span class="total-amount">￥{{ totalAmount }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="goBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">提交预约</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'BookingFormPage',
  data() {
    return {
      property: null,
      loading: false,
      error: null,
      form: {
        checkIn: '',
        checkOut: '',
        guestCount: 1
      }
    }
  },
  computed: {
    propertyId() {
      return this.$route.params.id
    },
    minCheckInDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    minCheckOutDate() {
      if (!this.form.checkIn) {
        return this.minCheckInDate
      }
      const checkIn = new Date(this.form.checkIn)
      checkIn.setDate(checkIn.getDate() + 1)
      return checkIn.toISOString().split('T')[0]
    },
    days() {
      if (!this.form.checkIn || !this.form.checkOut) {
        return 0
      }
      const checkIn = new Date(this.form.checkIn)
      const checkOut = new Date(this.form.checkOut)
      const diffTime = Math.abs(checkOut - checkIn)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },
    roomSubtotal() {
      if (!this.property) return 0
      return (this.property.pricePerNight * this.days).toFixed(2)
    },
    totalAmount() {
      if (!this.property) return 0
      const roomFee = this.property.pricePerNight * this.days
      const cleaningFee = this.property.cleaningFee || 0
      const securityDeposit = this.property.securityDeposit || 0
      return (roomFee + cleaningFee + securityDeposit).toFixed(2)
    },
    isFormValid() {
      return this.form.checkIn && this.form.checkOut && this.form.guestCount > 0 && this.days > 0
    }
  },
  async created() {
    await this.fetchPropertyDetail()
  },
  methods: {
    async fetchPropertyDetail() {
      if (!this.propertyId) {
        this.error = '房源ID不存在'
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await request.get(`/api/properties/${this.propertyId}`)
        if (res.data && res.data.code === 200) {
          this.property = res.data.data
        } else {
          this.error = res.data?.message || '获取房源详情失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取房源详情失败'
      } finally {
        this.loading = false
      }
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        alert('请填写完整的预约信息')
        return
      }

      try {
        this.loading = true
        const payload = {
          propertyId: this.propertyId,
          checkIn: new Date(this.form.checkIn),
          checkOut: new Date(this.form.checkOut),
          guestCount: this.form.guestCount
        }

        const res = await request.post('/api/bookings', payload)
        if (res.data && res.data.code === 200) {
          alert('预约申请已提交，请等待房东确认')
          this.$router.push(`/bookings/${res.data.data.id}`)
        } else {
          alert(res.data?.message || '预约失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '预约失败')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push(`/properties/${this.propertyId}`)
    },
    propertyTypeText(type) {
      const types = {
        1: '整租',
        2: '合租',
        3: '单间'
      }
      return types[type] || '未知类型'
    },
    roomTypeText(type) {
      const types = {
        1: '一居室',
        2: '二居室',
        3: '三居室',
        4: '四居室及以上'
      }
      return types[type] || '未知户型'
    }
  }
}
</script>

<style scoped>
.booking-form {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  gap: 20px;
}

.title {
  margin: 0;
  font-size: 20px;
  color: #1f2933;
  flex: 1;
}

.content {
  flex: 1;
  padding: 24px 40px 40px;
}

.loading,
.error {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
}

.error {
  color: #b91c1c;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.property-info {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.property-title {
  margin: 0 0 12px;
  font-size: 20px;
  color: #111827;
}

.property-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4b5563;
}

.icon {
  font-size: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-row input {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-row input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.15);
}

.hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.price-section {
  margin-top: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
}

.price-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #111827;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: #4b5563;
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.total-amount {
  color: #15803d;
  font-size: 18px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #42b983;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #35a372;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #42b983;
  border: 2px solid #42b983;
}

.btn-outline:hover {
  background: #42b983;
  color: #ffffff;
}

@media (max-width: 768px) {
  .header {
    padding: 12px 20px;
  }

  .content {
    padding: 16px 20px;
  }

  .form-container {
    padding: 20px;
  }

  .property-details {
    flex-direction: column;
    gap: 8px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>