<template>
  <div class="host-booking-detail">
    <header class="header">
      <h1 class="title">预约详情</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="!booking" class="state">预约不存在</div>
      
      <div v-else class="booking-detail">
        <div class="info-card">
          <div class="card-section">
            <h2 class="section-title">房源信息</h2>
            <h3 class="property-title">{{ booking.propertyTitle }}</h3>
            <div class="info-item">
              <span class="label">地址:</span>
              <span class="value">{{ booking.propertyAddress || '未知地址' }}</span>
            </div>
          </div>

          <div class="card-section">
            <h2 class="section-title">预约信息</h2>
            <div class="info-item">
              <span class="label">预约状态:</span>
              <span class="status-tag" :class="`status-${booking.status}`">
                {{ statusText(booking.status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">入住日期:</span>
              <span class="value">{{ formatDate(booking.checkIn) }}</span>
            </div>
            <div class="info-item">
              <span class="label">退房日期:</span>
              <span class="value">{{ formatDate(booking.checkOut) }}</span>
            </div>
            <div class="info-item">
              <span class="label">入住人数:</span>
              <span class="value">{{ booking.guestCount }} 人</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(booking.createdAt) }}</span>
            </div>
          </div>

          <div class="card-section">
            <h2 class="section-title">租客信息</h2>
            <div class="info-item">
              <span class="label">租客姓名:</span>
              <span class="value">{{ booking.guestName || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话:</span>
              <span class="value">{{ booking.guestPhone || '未知' }}</span>
            </div>
          </div>

          <div class="card-section">
            <h2 class="section-title">费用信息</h2>
            <div class="info-item">
              <span class="label">订单金额:</span>
              <span class="value">￥{{ booking.totalAmount }}</span>
            </div>
            <div class="info-item">
              <span class="label">实付金额:</span>
              <span class="value">￥{{ booking.paidAmount }}</span>
            </div>
          </div>

          <div class="card-section action-section">
            <h2 class="section-title">操作</h2>
            <div class="action-buttons">
              <button v-if="booking.status === 0" class="btn btn-primary" @click="confirmBooking">
                确认预约
              </button>
              <button v-if="booking.status === 0" class="btn btn-outline" @click="rejectBooking">
                拒绝预约
              </button>
              <button class="btn btn-secondary" @click="contactGuest">
                联系租客
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'HostBookingDetailPage',
  data() {
    return {
      booking: null,
      loading: false,
      error: null
    }
  },
  async created() {
    await this.fetchBookingDetail()
  },
  methods: {
    async fetchBookingDetail() {
      this.loading = true
      this.error = null
      try {
        const { id } = this.$route.params
        const res = await request.get(`/api/bookings/${id}`)
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
    contactGuest() {
      if (!this.booking.guestId) {
        alert('无法获取租客信息')
        return
      }
      // 跳转到聊天页面
      this.$router.push({
        path: `/chat/${this.booking.guestId}`,
        query: {
          propertyId: this.booking.propertyId
        }
      })
    },
    async confirmBooking() {
      try {
        const res = await request.post(`/api/bookings/${this.booking.id}/confirm`)
        if (res.data && res.data.code === 200) {
          alert('确认预约成功')
          await this.fetchBookingDetail()
        } else {
          alert(res.data?.message || '确认失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '确认失败')
      }
    },
    async rejectBooking() {
      try {
        const res = await request.post(`/api/bookings/${this.booking.id}/reject`)
        if (res.data && res.data.code === 200) {
          alert('拒绝预约成功')
          await this.fetchBookingDetail()
        } else {
          alert(res.data?.message || '拒绝失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '拒绝失败')
      }
    },
    statusText(status) {
      switch (status) {
        case 0: return '待确认'
        case 1: return '待支付'
        case 2: return '已支付'
        case 3: return '已入住'
        case 4: return '已完成'
        case 5: return '已取消'
        default: return '未知状态'
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.host-booking-detail {
  height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  padding: 16px 30px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: 22px;
  color: #111827;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 24px 30px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  display: flex;
  align-items: center;
}

.state {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: #6b7280;
  width: 100%;
}

.state.error {
  color: #b91c1c;
}

.booking-detail {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-section {
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f2f5;
}

.card-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 14px;
  background: #3b82f6;
  border-radius: 2px;
}

.property-title {
  margin: 0 0 10px 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  padding: 5px 0;
}

.label {
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
  flex-shrink: 0;
}

.value {
  color: #111827;
  flex: 1;
  font-weight: 400;
}

.status-tag {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  min-width: 70px;
  border: 1px solid transparent;
}

.status-0 {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.status-1 {
  background: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

.status-2 {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.status-3 {
  background: #e0e7ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.status-4 {
  background: #ecfdf5;
  color: #059669;
  border-color: #d1fae5;
}

.status-5 {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.action-section {
  padding-bottom: 0 !important;
  border-bottom: none !important;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  padding-top: 6px;
}

.btn {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  flex: 1;
  max-width: 150px;
  text-align: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-outline {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  border: 1px solid transparent;
}

.btn-secondary:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .content {
    padding: 16px 20px;
  }

  .info-card {
    padding: 20px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .label {
    min-width: unset;
  }

  .action-section {
    flex-direction: column;
    gap: 12px;
  }

  .btn {
    max-width: none;
  }
}
</style>