<template>
  <div class="booking-detail">
    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!booking" class="error">预约信息加载失败</div>
      
      <div v-else class="detail-container">
        <!-- 预约状态 -->
        <div class="status-section">
          <span class="status-tag" :class="`status-${booking.status}`">
            {{ booking.statusText }}
          </span>
        </div>

        <!-- 房源信息 -->
        <div class="property-section">
          <h2 class="section-title">房源信息</h2>
          <div class="property-info">
            <h3 class="property-title">{{ booking.propertyTitle }}</h3>
            <div class="property-owner">
              <span class="label">房东：</span>
              <span>{{ booking.ownerUsername }}</span>
            </div>
          </div>
        </div>

        <!-- 预约信息 -->
        <div class="booking-section">
          <h2 class="section-title">预约信息</h2>
          <div class="info-item">
            <span class="label">入住日期：</span>
            <span>{{ formatDate(booking.checkIn) }}</span>
          </div>
          <div class="info-item">
            <span class="label">退房日期：</span>
            <span>{{ formatDate(booking.checkOut) }}</span>
          </div>
          <div class="info-item">
            <span class="label">入住人数：</span>
            <span>{{ booking.guestCount }} 人</span>
          </div>
          <div class="info-item">
            <span class="label">预约时间：</span>
            <span>{{ formatDateTime(booking.createdAt) }}</span>
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="price-section">
          <h2 class="section-title">价格信息</h2>
          <div class="price-item">
            <span>订单金额</span>
            <span>￥{{ booking.totalAmount }}</span>
          </div>
          <div class="price-item">
            <span>实付金额</span>
            <span>￥{{ booking.paidAmount || 0 }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <button 
            v-if="booking.status === 1" 
            class="btn btn-primary" 
            @click="goToPayment"
          >
            立即支付
          </button>
          <button 
            v-if="booking.status === 0 || booking.status === 1" 
            class="btn btn-outline" 
            @click="cancelBooking"
          >
            取消预约
          </button>
          <button 
            v-if="booking.status === 2 && canApplyRefund" 
            class="btn btn-outline" 
            @click="applyRefund"
          >
            申请退款
          </button>
          <button 
            v-if="booking.status === 2 || booking.status === 3" 
            class="btn btn-primary" 
            @click="completeBooking"
          >
            完成入住
          </button>
          <button 
            v-if="booking.status === 3" 
            class="btn btn-primary" 
            @click="goToReview"
          >
            评价房源
          </button>
          <button 
            v-if="booking.status === 2 || booking.status === 3" 
            class="btn btn-outline" 
            @click="goToComplaint"
          >
            投诉房源
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'BookingDetailPage',
  data() {
    return {
      booking: null,
      loading: false,
      error: null
    }
  },
  computed: {
    bookingId() {
      return this.$route.params.id
    },
    canApplyRefund() {
      if (!this.booking || this.booking.status !== 2) {
        return false
      }
      // 判断是否在入住日期之前
      const now = new Date()
      const checkIn = new Date(this.booking.checkIn)
      return now < checkIn
    }
  },
  async created() {
    await this.fetchBookingDetail()
  },
  methods: {
    async fetchBookingDetail() {
      if (!this.bookingId) {
        this.error = '预约ID不存在'
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await request.get(`/api/bookings/${this.bookingId}`)
        if (res.data && res.data.code === 200) {
          this.booking = res.data.data
        } else {
          this.error = res.data?.message || '获取预约详情失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取预约详情失败'
      } finally {
        this.loading = false
      }
    },
    async cancelBooking() {
      if (!confirm('确定要取消预约吗？')) {
        return
      }

      try {
        this.loading = true
        const res = await request.post(`/api/bookings/${this.bookingId}/cancel`)
        if (res.data && res.data.code === 200) {
          alert('预约已取消')
          await this.fetchBookingDetail()
        } else {
          alert(res.data?.message || '取消预约失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '取消预约失败')
      } finally {
        this.loading = false
      }
    },
    async goToPayment() {
      try {
        // 模拟支付宝支付
        const paymentData = {
          bookingId: this.booking.id,
          amount: this.booking.totalAmount,
          paymentMethod: 2 // 2支付宝
        }

        const res = await request.post('/api/bookings/payment', paymentData)
        if (res.data && res.data.code === 200) {
          alert('支付成功')
          await this.fetchBookingDetail()
        } else {
          alert(res.data?.message || '支付失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '支付失败')
      }
    },
    async completeBooking() {
      if (!confirm('确认已完成入住？完成后可以进行评价。')) {
        return
      }
      try {
        const res = await request.post(`/api/bookings/${this.bookingId}/complete`)
        if (res.data && res.data.code === 200) {
          alert('完成入住成功，现在可以进行评价了')
          await this.fetchBookingDetail()
        } else {
          alert(res.data?.message || '完成入住失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '完成入住失败')
      }
    },
    applyRefund() {
      this.$router.push(`/bookings/${this.bookingId}/refund`)
    },
    goToReview() {
      this.$router.push(`/bookings/${this.bookingId}/review`)
    },
    goToComplaint() {
      this.$router.push(`/bookings/${this.bookingId}/complaint`)
    },
    goBack() {
      this.$router.push('/bookings')
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.booking-detail {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
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

.detail-container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.status-section {
  margin-bottom: 24px;
  text-align: center;
}

.status-tag {
  display: inline-block;
  padding: 8px 24px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 600;
}

.status-0 {
  background: #fef3c7;
  color: #92400e;
}

.status-1 {
  background: #dbeafe;
  color: #1e40af;
}

.status-2 {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-3 {
  background: #ecfdf3;
  color: #15803d;
}

.status-4 {
  background: #fee2e2;
  color: #b91c1c;
}

.property-section,
.booking-section,
.price-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.property-section:last-child,
.booking-section:last-child,
.price-section:last-child {
  border-bottom: none;
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.property-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #1f2933;
}

.property-owner {
  font-size: 14px;
  color: #4b5563;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.label {
  font-weight: 500;
  color: #374151;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.action-section {
  display: flex;
  gap: 12px;
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

.btn-primary:hover {
  background: #35a372;
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
  .content {
    padding: 16px 20px;
  }

  .detail-container {
    padding: 20px;
  }

  .action-section {
    flex-direction: column;
  }
}
</style>