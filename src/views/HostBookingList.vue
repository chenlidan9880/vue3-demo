<template>
  <div class="host-booking-list">
    <header class="header">
      <h1 class="title">我的房源预约</h1>
      <p class="subtitle">查看和管理所有房源的预约</p>
    </header>

    <main class="content">
      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="list.length === 0" class="state">暂无预约记录</div>
      
      <div v-else class="booking-grid">
        <div v-for="booking in list" :key="booking.id" class="booking-card">
          <div class="card-header">
            <h3 class="card-title">{{ booking.propertyTitle }}</h3>
            <span class="status-tag" :class="`status-${booking.status}`">
              {{ statusText(booking.status) }}
            </span>
          </div>
          
          <div class="card-body">
            <div class="info-item">
              <span class="icon">📅</span>
              <span>{{ formatDate(booking.checkIn) }} - {{ formatDate(booking.checkOut) }}</span>
            </div>
            <div class="info-item">
              <span class="icon">👥</span>
              <span>{{ booking.guestCount }} 人</span>
            </div>
            <div class="info-item">
              <span class="icon">💰</span>
              <span>￥{{ booking.totalAmount }}</span>
            </div>
            <div class="info-item">
              <span class="icon">👤</span>
              <span>租客: {{ booking.guestName }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <div v-if="booking.status === 0" class="action-buttons">
              <button class="btn btn-primary" @click="confirmBooking(booking.id)">
                确认
              </button>
              <button class="btn btn-outline" @click="rejectBooking(booking.id)">
                拒绝
              </button>
            </div>
            <button v-else class="btn btn-primary" @click="goToDetail(booking.id)">
              查看详情
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
  name: 'HostBookingListPage',
  data() {
    return {
      list: [],
      loading: false,
      error: null
    }
  },
  async created() {
    await this.fetchBookings()
  },
  methods: {
    async fetchBookings() {
      this.loading = true
      this.error = null
      try {
        const res = await request.get('/api/bookings/owner')
        if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
          // 为每个预约获取房源标题和租客信息
          const bookingsWithDetails = await Promise.all(
            res.data.data.map(async (booking) => {
              try {
                const detailRes = await request.get(`/api/bookings/${booking.id}`)
                if (detailRes.data && detailRes.data.code === 200) {
                  return {
                    ...booking,
                    propertyTitle: detailRes.data.data.propertyTitle,
                    guestName: detailRes.data.data.guestName || '未知租客'
                  }
                }
                return booking
              } catch (e) {
                return booking
              }
            })
          )
          this.list = bookingsWithDetails
        } else {
          this.error = res.data?.message || '获取预约列表失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取预约列表失败'
      } finally {
        this.loading = false
      }
    },
    goToDetail(bookingId) {
      this.$router.push(`/host/bookings/${bookingId}`)
    },
    statusText(status) {
      switch (status) {
        case 0: return '待确认'
        case 1: return '待支付'
        case 2: return '已支付'
        case 3: return '已完成'
        case 4: return '已取消'
        case 5: return '已拒绝'
        default: return '未知状态'
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    async confirmBooking(bookingId) {
      try {
        const res = await request.post(`/api/bookings/${bookingId}/confirm`)
        if (res.data && res.data.code === 200) {
          alert('确认预约成功')
          this.fetchBookings()
        } else {
          alert(res.data?.message || '确认失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '确认失败')
      }
    },
    async rejectBooking(bookingId) {
      try {
        const res = await request.post(`/api/bookings/${bookingId}/reject`)
        if (res.data && res.data.code === 200) {
          alert('拒绝预约成功')
          this.fetchBookings()
        } else {
          alert(res.data?.message || '拒绝失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '拒绝失败')
      }
    }
  }
}
</script>

<style scoped>
.host-booking-list {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 20px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.title {
  margin: 0;
  font-size: 22px;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.content {
  flex: 1;
  padding: 24px 40px 40px;
}

.state {
  text-align: center;
  padding: 60px 0;
  font-size: 16px;
  color: #6b7280;
}

.state.error {
  color: #b91c1c;
}

.booking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.booking-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.booking-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.card-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
  margin-right: 12px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
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

.status-5 {
  background: #fee2e2;
  color: #b91c1c;
}

.card-body {
  padding: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
}

.icon {
  font-size: 16px;
  flex-shrink: 0;
}

.card-footer {
  padding: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
}

.action-buttons .btn {
  flex: 1;
}

.btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
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
  background: #ffffff;
  color: #42b983;
  border: 1px solid #42b983;
}

.btn-outline:hover {
  background: #f0fdf4;
}

@media (max-width: 768px) {
  .header {
    padding: 16px 20px;
  }

  .content {
    padding: 16px 20px;
  }

  .booking-grid {
    grid-template-columns: 1fr;
  }
}
</style>