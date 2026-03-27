<template>
  <div class="review-form">
    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!booking" class="error">预约信息加载失败</div>
      
      <!-- 已评价展示 -->
      <div v-else-if="existingReview" class="form-container">
        <div class="review-display">
          <div class="status-header">
            <span class="status-badge-large reviewed">✓ 已评价</span>
          </div>
          
          <div class="booking-info">
            <h2 class="section-title">预约信息</h2>
            <div class="info-item">
              <span class="label">房源：</span>
              <span>{{ booking.propertyTitle }}</span>
            </div>
            <div class="info-item">
              <span class="label">入住日期：</span>
              <span>{{ formatDate(booking.checkIn) }}</span>
            </div>
            <div class="info-item">
              <span class="label">退房日期：</span>
              <span>{{ formatDate(booking.checkOut) }}</span>
            </div>
          </div>
          
          <div class="review-content">
            <h2 class="section-title">您的评价</h2>
            <div class="score-row">
              <span class="score-label">卫生评分：</span>
              <div class="rating-display">
                <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= existingReview.cleanlinessScore }">★</span>
                <span class="score-value">{{ existingReview.cleanlinessScore }}分</span>
              </div>
            </div>
            <div class="score-row">
              <span class="score-label">位置评分：</span>
              <div class="rating-display">
                <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= existingReview.locationScore }">★</span>
                <span class="score-value">{{ existingReview.locationScore }}分</span>
              </div>
            </div>
            <div class="score-row">
              <span class="score-label">设施评分：</span>
              <div class="rating-display">
                <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= existingReview.facilityScore }">★</span>
                <span class="score-value">{{ existingReview.facilityScore }}分</span>
              </div>
            </div>
            <div class="score-row">
              <span class="score-label">服务评分：</span>
              <div class="rating-display">
                <span v-for="n in 5" :key="n" class="star" :class="{ active: n <= existingReview.serviceScore }">★</span>
                <span class="score-value">{{ existingReview.serviceScore }}分</span>
              </div>
            </div>
            <div class="overall-score">
              <span>综合评分：</span>
              <span class="score">{{ existingReview.overallScore }}分</span>
            </div>
            <div class="content-section" v-if="existingReview.content">
              <h3>评价内容</h3>
              <p class="content-text">{{ existingReview.content }}</p>
            </div>
            <div class="review-time">
              <span>评价时间：{{ formatDate(existingReview.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 评价表单 -->
      <div v-else class="form-container">
        <!-- 预约信息 -->
        <div class="booking-info">
          <h2 class="section-title">预约信息</h2>
          <div class="info-item">
            <span class="label">房源：</span>
            <span>{{ booking.propertyTitle }}</span>
          </div>
          <div class="info-item">
            <span class="label">入住日期：</span>
            <span>{{ formatDate(booking.checkIn) }}</span>
          </div>
          <div class="info-item">
            <span class="label">退房日期：</span>
            <span>{{ formatDate(booking.checkOut) }}</span>
          </div>
        </div>

        <!-- 评分表单 -->
        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-row">
            <label>卫生评分 *</label>
            <div class="rating">
              <span 
                v-for="n in 5" 
                :key="n"
                class="star"
                :class="{ active: n <= form.cleanlinessScore }"
                @click="form.cleanlinessScore = n"
              >★</span>
            </div>
            <span class="score-text">{{ form.cleanlinessScore }}分</span>
          </div>

          <div class="form-row">
            <label>位置评分 *</label>
            <div class="rating">
              <span 
                v-for="n in 5" 
                :key="n"
                class="star"
                :class="{ active: n <= form.locationScore }"
                @click="form.locationScore = n"
              >★</span>
            </div>
            <span class="score-text">{{ form.locationScore }}分</span>
          </div>

          <div class="form-row">
            <label>设施评分 *</label>
            <div class="rating">
              <span 
                v-for="n in 5" 
                :key="n"
                class="star"
                :class="{ active: n <= form.facilityScore }"
                @click="form.facilityScore = n"
              >★</span>
            </div>
            <span class="score-text">{{ form.facilityScore }}分</span>
          </div>

          <div class="form-row">
            <label>服务评分 *</label>
            <div class="rating">
              <span 
                v-for="n in 5" 
                :key="n"
                class="star"
                :class="{ active: n <= form.serviceScore }"
                @click="form.serviceScore = n"
              >★</span>
            </div>
            <span class="score-text">{{ form.serviceScore }}分</span>
          </div>

          <div class="overall-score">
            <span>综合评分：</span>
            <span class="score">{{ overallScore }}分</span>
          </div>

          <div class="form-row">
            <label for="content">评价内容</label>
            <textarea 
              id="content" 
              v-model="form.content" 
              rows="4" 
              placeholder="请分享您的入住体验，帮助其他租客更好地了解这套房源"
            ></textarea>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="goBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || submitting">
              {{ submitting ? '提交中...' : '提交评价' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'ReviewFormPage',
  data() {
    return {
      booking: null,
      loading: false,
      error: null,
      submitting: false,
      existingReview: null,
      form: {
        cleanlinessScore: 5,
        locationScore: 5,
        facilityScore: 5,
        serviceScore: 5,
        content: ''
      }
    }
  },
  computed: {
    bookingId() {
      return this.$route.params.id
    },
    overallScore() {
      const sum = this.form.cleanlinessScore + this.form.locationScore + 
                  this.form.facilityScore + this.form.serviceScore
      return (sum / 4).toFixed(1)
    },
    isFormValid() {
      return this.form.cleanlinessScore > 0 && 
             this.form.locationScore > 0 && 
             this.form.facilityScore > 0 && 
             this.form.serviceScore > 0
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
          // 验证订单状态
          if (this.booking.status !== 3) {
            this.error = '订单完成后才能评价'
          } else {
            // 检查是否已评价
            await this.checkExistingReview()
          }
        } else {
          this.error = res.data?.message || '获取预约详情失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取预约详情失败'
      } finally {
        this.loading = false
      }
    },
    async checkExistingReview() {
      try {
        const res = await request.get(`/api/reviews/booking/${this.bookingId}`)
        if (res.data && res.data.code === 200 && res.data.data) {
          this.existingReview = res.data.data
        }
      } catch (e) {
        // 未评价或查询失败，不做处理
        console.log('未找到评价记录')
      }
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        alert('请完成所有评分项')
        return
      }

      try {
        this.submitting = true
        const reviewData = {
          bookingId: parseInt(this.bookingId),
          cleanlinessScore: this.form.cleanlinessScore,
          locationScore: this.form.locationScore,
          facilityScore: this.form.facilityScore,
          serviceScore: this.form.serviceScore,
          content: this.form.content
        }

        const res = await request.post('/api/reviews', reviewData)
        if (res.data && res.data.code === 200) {
          alert('评价提交成功')
          this.$router.push(`/bookings/${this.bookingId}`)
        } else {
          alert(res.data?.message || '评价提交失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '评价提交失败')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.back()
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.review-form {
  min-height: 100vh;
  background: #f3f4f6;
}

.content {
  padding: 24px 40px 40px;
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error {
  background: #ffffff;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.form-container {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.booking-info {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.label {
  font-size: 14px;
  color: #6b7280;
  min-width: 80px;
}

.form-row {
  margin-bottom: 20px;
}

.form-row label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.rating {
  display: inline-flex;
  gap: 8px;
  margin-right: 12px;
}

.star {
  font-size: 28px;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active {
  color: #fbbf24;
}

.star:hover {
  color: #fbbf24;
}

.score-text {
  font-size: 14px;
  color: #6b7280;
}

.overall-score {
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.overall-score .score {
  font-size: 24px;
  font-weight: 600;
  color: #fbbf24;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
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

/* 已评价展示样式 */
.review-display {
  padding: 24px;
}

.status-header {
  text-align: center;
  margin-bottom: 24px;
}

.status-badge-large {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 28px;
  font-size: 20px;
  font-weight: 600;
}

.status-badge-large.reviewed {
  background: #d1fae5;
  color: #065f46;
}

.review-content {
  background: #f9fafb;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.score-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.score-label {
  min-width: 100px;
  font-size: 14px;
  color: #6b7280;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-display .star {
  font-size: 24px;
  cursor: default;
}

.rating-display .star.active {
  color: #fbbf24;
}

.score-value {
  font-size: 14px;
  color: #374151;
  margin-left: 8px;
}

.content-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.content-section h3 {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.content-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  background: #fff;
  padding: 16px;
  border-radius: 6px;
}

.review-time {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .content {
    padding: 16px 24px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .score-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>