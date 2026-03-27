<template>
  <div class="review-list">
    <header class="header">
      <button class="btn btn-outline" @click="goBack">返回房源详情</button>
      <h1 class="title">房源评价</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="reviews.length === 0" class="empty">暂无评价</div>
      
      <div v-else class="reviews-container">
        <!-- 房源评分概览 -->
        <div class="rating-overview">
          <div class="overall-rating">
            <span class="score">{{ propertyRating }}</span>
            <span class="label">综合评分</span>
          </div>
          <div class="rating-details">
            <div class="rating-item">
              <span class="label">卫生</span>
              <div class="stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= avgScores.cleanliness }"
                >★</span>
              </div>
              <span class="score">{{ avgScores.cleanliness }}</span>
            </div>
            <div class="rating-item">
              <span class="label">位置</span>
              <div class="stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= avgScores.location }"
                >★</span>
              </div>
              <span class="score">{{ avgScores.location }}</span>
            </div>
            <div class="rating-item">
              <span class="label">设施</span>
              <div class="stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= avgScores.facility }"
                >★</span>
              </div>
              <span class="score">{{ avgScores.facility }}</span>
            </div>
            <div class="rating-item">
              <span class="label">服务</span>
              <div class="stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= avgScores.service }"
                >★</span>
              </div>
              <span class="score">{{ avgScores.service }}</span>
            </div>
          </div>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-list">
          <div 
            v-for="review in reviews" 
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <div class="reviewer-info">
                <div class="avatar" v-if="review.guestAvatar">
                  <img :src="review.guestAvatar" :alt="review.guestUsername" />
                </div>
                <div class="avatar" v-else>
                  <span>{{ getInitial(review.guestUsername) }}</span>
                </div>
                <div class="reviewer-details">
                  <span class="username">{{ review.guestUsername }}</span>
                  <span class="date">{{ formatDate(review.createdAt) }}</span>
                </div>
              </div>
              <div class="review-rating">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= review.overallScore }"
                >★</span>
                <span class="score">{{ review.overallScore }}</span>
              </div>
            </div>
            
            <div class="review-content">
              <p>{{ review.content }}</p>
            </div>
            
            <div class="review-scores">
              <div class="score-item">
                <span class="label">卫生：</span>
                <span class="score">{{ review.cleanlinessScore }}分</span>
              </div>
              <div class="score-item">
                <span class="label">位置：</span>
                <span class="score">{{ review.locationScore }}分</span>
              </div>
              <div class="score-item">
                <span class="label">设施：</span>
                <span class="score">{{ review.facilityScore }}分</span>
              </div>
              <div class="score-item">
                <span class="label">服务：</span>
                <span class="score">{{ review.serviceScore }}分</span>
              </div>
            </div>
            
            <div class="owner-reply" v-if="review.ownerReply">
              <div class="reply-header">
                <span class="reply-label">房东回复：</span>
                <span class="reply-date">{{ formatDate(review.replyTime) }}</span>
              </div>
              <p class="reply-content">{{ review.ownerReply }}</p>
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
  name: 'ReviewListPage',
  data() {
    return {
      reviews: [],
      loading: false,
      error: null,
      propertyRating: 0,
      avgScores: {
        cleanliness: 0,
        location: 0,
        facility: 0,
        service: 0
      }
    }
  },
  computed: {
    propertyId() {
      return this.$route.params.id
    }
  },
  async created() {
    await this.fetchReviews()
  },
  methods: {
    async fetchReviews() {
      if (!this.propertyId) {
        this.error = '房源ID不存在'
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await request.get(`/api/reviews/property/${this.propertyId}`)
        if (res.data && res.data.code === 200) {
          this.reviews = res.data.data || []
          this.calculateAverageScores()
        } else {
          this.error = res.data?.message || '获取评价列表失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取评价列表失败'
      } finally {
        this.loading = false
      }
    },
    calculateAverageScores() {
      if (this.reviews.length === 0) {
        return
      }

      let totalCleanliness = 0
      let totalLocation = 0
      let totalFacility = 0
      let totalService = 0

      this.reviews.forEach(review => {
        totalCleanliness += review.cleanlinessScore
        totalLocation += review.locationScore
        totalFacility += review.facilityScore
        totalService += review.serviceScore
      })

      this.avgScores = {
        cleanliness: (totalCleanliness / this.reviews.length).toFixed(1),
        location: (totalLocation / this.reviews.length).toFixed(1),
        facility: (totalFacility / this.reviews.length).toFixed(1),
        service: (totalService / this.reviews.length).toFixed(1)
      }

      // 计算综合评分
      const totalOverall = this.reviews.reduce((sum, review) => sum + review.overallScore, 0)
      this.propertyRating = (totalOverall / this.reviews.length).toFixed(1)
    },
    getInitial(username) {
      return username ? username.charAt(0).toUpperCase() : 'U'
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.review-list {
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
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error, .empty {
  background: #ffffff;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.reviews-container {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.rating-overview {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.overall-rating {
  text-align: center;
  margin-right: 40px;
}

.overall-rating .score {
  display: block;
  font-size: 48px;
  font-weight: 600;
  color: #fbbf24;
  line-height: 1;
}

.overall-rating .label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

.rating-details {
  flex: 1;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.rating-item .label {
  min-width: 40px;
  font-size: 14px;
  color: #6b7280;
}

.rating-item .stars {
  flex: 1;
  margin: 0 12px;
}

.star {
  font-size: 16px;
  color: #d1d5db;
  margin-right: 4px;
}

.star.active {
  color: #fbbf24;
}

.rating-item .score {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar span {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.date {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.review-rating {
  display: flex;
  align-items: center;
}

.review-rating .star {
  font-size: 14px;
  margin-right: 2px;
}

.review-rating .score {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-left: 8px;
}

.review-content {
  margin-bottom: 16px;
}

.review-content p {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  margin: 0;
}

.review-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #ffffff;
  border-radius: 6px;
}

.score-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.score-item .label {
  color: #6b7280;
  margin-right: 4px;
}

.score-item .score {
  color: #374151;
  font-weight: 500;
}

.owner-reply {
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.reply-label {
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
}

.reply-date {
  font-size: 12px;
  color: #6b7280;
}

.reply-content {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  margin: 0;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  background: transparent;
  color: #f9fafb;
  border-color: #f9fafb;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
  
  .rating-overview {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .overall-rating {
    margin-bottom: 20px;
  }
  
  .review-scores {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
