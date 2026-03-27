<template>
  <div class="property-detail-page">
    <main class="content" v-if="loading">
      <div class="loading">加载中...</div>
    </main>

    <main class="content" v-else-if="error">
      <div class="error">{{ error }}</div>
    </main>

    <main class="content" v-else-if="property">
      <!-- 图片轮播 -->
      <div class="image-gallery">
        <div class="main-image">
          <div class="image-placeholder" v-if="!property.images || property.images.length === 0">
            <span class="placeholder-text">{{ property.city || '房源图片' }}</span>
          </div>
          <div v-else class="carousel-container">
            <div 
              class="carousel-slide" 
              :style="{ transform: `translateX(-${activeImageIndex * 100}%)` }"
            >
              <div 
                v-for="(image, index) in property.images" 
                :key="index"
                class="carousel-item"
                @click="openImagePreview(index)"
              >
                <img :src="image.imageUrl" :alt="property.title" />
              </div>
            </div>
            <!-- 轮播控制按钮 -->
            <button 
              class="carousel-btn prev"
              @click="prevImage"
              v-if="property.images.length > 1"
            >
              ‹
            </button>
            <button 
              class="carousel-btn next"
              @click="nextImage"
              v-if="property.images.length > 1"
            >
              ›
            </button>
            <!-- 轮播指示器 -->
            <div class="carousel-indicators" v-if="property.images.length > 1">
              <div 
                v-for="(image, index) in property.images" 
                :key="index"
                class="indicator"
                :class="{ active: activeImageIndex === index }"
                @click="setActiveImage(index)"
              ></div>
            </div>
            <!-- 图片预览提示 -->
            <div class="preview-hint" v-if="property.images && property.images.length > 0">
              <span>点击图片查看大图</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片预览模态框 -->
      <div class="image-preview-modal" v-if="showImagePreview" @click="closeImagePreview">
        <div class="preview-content" @click.stop>
          <button class="close-btn" @click="closeImagePreview">×</button>
          <button class="preview-nav prev" @click="prevPreviewImage" v-if="property.images.length > 1">‹</button>
          <img :src="property.images[previewImageIndex].imageUrl" :alt="property.title" />
          <button class="preview-nav next" @click="nextPreviewImage" v-if="property.images.length > 1">›</button>
          <div class="preview-counter">{{ previewImageIndex + 1 }} / {{ property.images.length }}</div>
        </div>
      </div>

      <!-- 房源信息 -->
      <div class="info-section">
        <div class="info-header">
          <h2 class="property-title">{{ property.title }}</h2>
          <div class="price-section">
            <span class="price">￥{{ property.pricePerNight }}</span>
            <span class="price-unit">/ 晚</span>
          </div>
        </div>

        <div class="location-section">
          <span class="location-icon">📍</span>
          <span class="location-text">{{ property.city }} · {{ property.district }} · {{ property.address }}</span>
        </div>

        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-icon">🏠</span>
            <span class="stat-text">{{ propertyTypeText(property.propertyType) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🛏️</span>
            <span class="stat-text">{{ roomTypeText(property.roomType) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📏</span>
            <span class="stat-text">{{ property.area || 0 }}㎡</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">👥</span>
            <span class="stat-text">可住 {{ property.maxGuests || 1 }} 人</span>
          </div>
        </div>

        <div class="status-section">
          <span class="status-tag" :class="`status-${property.status}`">
            {{ statusText(property.status) }}
          </span>
          <span class="verify-tag" v-if="property.isVerified">
            ✅ 已审核
          </span>
        </div>

        <!-- 评价信息 -->
        <div class="rating-section">
          <div class="rating-header">
            <div class="rating-info">
              <span class="rating-score">{{ property.rating || 0 }}</span>
              <div class="rating-stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ active: n <= (property.rating || 0) }"
                >★</span>
              </div>
              <span class="review-count">({{ property.reviewCount || 0 }}条评价)</span>
            </div>
            <button class="btn btn-outline review-btn" @click="goToReviews">
              查看全部评价
            </button>
          </div>
        </div>

        <!-- 详细描述 -->
        <div class="description-section">
          <h3>房源描述</h3>
          <p class="description">{{ property.description || '暂无描述' }}</p>
        </div>

        <!-- 价格详情 -->
        <div class="pricing-section">
          <h3>价格详情</h3>
          <div class="price-item">
            <span>每晚价格</span>
            <span>￥{{ property.pricePerNight }}</span>
          </div>
          <div class="price-item">
            <span>清洁费</span>
            <span>￥{{ property.cleaningFee || 0 }}</span>
          </div>
          <div class="price-item">
            <span>押金</span>
            <span>￥{{ property.securityDeposit || 0 }}</span>
          </div>
        </div>

        <!-- 入住信息 -->
        <div class="check-section">
          <h3>入住信息</h3>
          <div class="check-item">
            <span>入住时间</span>
            <span>{{ property.checkInTime || '灵活安排' }}</span>
          </div>
          <div class="check-item">
            <span>退房时间</span>
            <span>{{ property.checkOutTime || '灵活安排' }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <button class="btn btn-primary" @click="goToBooking">立即预订</button>
          <button class="btn btn-outline" @click="contactHost">联系房东</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'PropertyDetailPage',
  data() {
    return {
      property: null,
      loading: false,
      error: null,
      activeImageIndex: 0,
      carouselTimer: null,
      carouselInterval: 3000,
      showImagePreview: false,
      previewImageIndex: 0
    }
  },
  mounted() {
    this.startCarousel()
  },
  beforeUnmount() {
    this.stopCarousel()
  },
  async created() {
    await this.fetchPropertyDetail()
  },
  methods: {
    async fetchPropertyDetail() {
      const propertyId = this.$route.params.id
      if (!propertyId) {
        this.error = '房源ID不存在'
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await request.get(`/api/properties/${propertyId}`)
        if (res.data && res.data.code === 200) {
          this.property = res.data.data
          // 确保images字段存在
          if (!this.property.images) {
            this.property.images = []
          }
          // 启动轮播
          this.$nextTick(() => {
            this.startCarousel()
          })
        } else {
          this.error = res.data?.message || '获取房源详情失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取房源详情失败'
      } finally {
        this.loading = false
      }
    },
    goBack() {
      // 返回上一页
      this.$router.back()
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
    },
    statusText(status) {
      if (status === 1) return '可预订'
      if (status === 2) return '维护中'
      if (status === 3) return '已下架'
      return '未知状态'
    },
    setActiveImage(index) {
      this.activeImageIndex = index
      this.restartCarousel()
    },
    nextImage() {
      if (!this.property || !this.property.images) return
      this.activeImageIndex = (this.activeImageIndex + 1) % this.property.images.length
      this.restartCarousel()
    },
    prevImage() {
      if (!this.property || !this.property.images) return
      this.activeImageIndex = (this.activeImageIndex - 1 + this.property.images.length) % this.property.images.length
      this.restartCarousel()
    },
    startCarousel() {
      if (!this.property || !this.property.images || this.property.images.length <= 1) return
      this.stopCarousel()
      this.carouselTimer = setInterval(() => {
        this.nextImage()
      }, this.carouselInterval)
    },
    stopCarousel() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer)
        this.carouselTimer = null
      }
    },
    restartCarousel() {
      this.stopCarousel()
      this.startCarousel()
    },
    goToBooking() {
      this.$router.push(`/properties/${this.$route.params.id}/book`)
    },
    goToReviews() {
      this.$router.push(`/properties/${this.$route.params.id}/reviews`)
    },
    contactHost() {
      if (!this.property || !this.property.ownerId) {
        alert('无法获取房东信息')
        return
      }
      
      this.$router.push({
        path: `/chat/${this.property.ownerId}`,
        query: {
          propertyId: this.property.id,
          propertyTitle: this.property.title
        }
      })
    },
    openImagePreview(index) {
      this.previewImageIndex = index
      this.showImagePreview = true
      this.stopCarousel()
      document.body.style.overflow = 'hidden'
    },
    closeImagePreview() {
      this.showImagePreview = false
      this.startCarousel()
      document.body.style.overflow = ''
    },
    prevPreviewImage() {
      if (!this.property || !this.property.images) return
      this.previewImageIndex = (this.previewImageIndex - 1 + this.property.images.length) % this.property.images.length
    },
    nextPreviewImage() {
      if (!this.property || !this.property.images) return
      this.previewImageIndex = (this.previewImageIndex + 1) % this.property.images.length
    }
  }
}
</script>

<style scoped>
.property-detail-page {
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

.image-gallery {
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  margin-bottom: 20px;
}

.main-image {
  height: 800px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
}

.image-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #42b983, #2c3e50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 24px;
  color: #ffffff;
  font-weight: 600;
}

/* 轮播样式 */
.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slide {
  display: flex;
  transition: transform 0.5s ease-in-out;
  height: 100%;
}

.carousel-item {
  flex: 0 0 100%;
  height: 100%;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 轮播控制按钮 */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1f2933;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 10;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn.prev {
  left: 20px;
}

.carousel-btn.next {
  right: 20px;
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

.indicator.active {
  background: #42b983;
  width: 30px;
  border-radius: 5px;
}

.info-section {
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.property-title {
  margin: 0;
  font-size: 24px;
  color: #111827;
  flex: 1;
}

.price-section {
  text-align: right;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.price-unit {
  font-size: 16px;
  color: #6b7280;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #4b5563;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 24px;
}

.stat-text {
  font-size: 13px;
  color: #4b5563;
  text-align: center;
}

.status-section {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
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

.verify-tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  background: #dbeafe;
  color: #1d4ed8;
}

/* 评价信息 */
.rating-section {
  margin: 20px 0;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-score {
  font-size: 24px;
  font-weight: 600;
  color: #f59e0b;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 16px;
  color: #d1d5db;
}

.star.active {
  color: #f59e0b;
}

.review-count {
  font-size: 14px;
  color: #6b7280;
}

.review-btn {
  font-size: 14px;
  padding: 6px 12px;
}

.description-section,
.pricing-section,
.check-section {
  margin-bottom: 24px;
}

.description-section h3,
.pricing-section h3,
.check-section h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #111827;
}

.description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}

.price-item,
.check-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.price-item:last-child,
.check-item:last-child {
  border-bottom: none;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-top: 32px;
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

  .main-image {
    height: 250px;
  }

  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .price-section {
    align-self: flex-start;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-section {
    flex-direction: column;
  }

  .action-section {
    flex-direction: column;
  }
}

.carousel-item {
  cursor: pointer;
}

.preview-hint {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  pointer-events: none;
  z-index: 5;
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.preview-content img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 32px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 36px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.preview-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-nav.prev {
  left: -70px;
}

.preview-nav.next {
  right: -70px;
}

.preview-counter {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 12px;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .preview-nav.prev {
    left: 10px;
  }

  .preview-nav.next {
    right: 10px;
  }

  .preview-content img {
    max-width: 95vw;
    max-height: 80vh;
  }
}
</style>