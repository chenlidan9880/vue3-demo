<template>
  <div class="community-page">
    <header class="header">
      <button class="btn btn-outline" @click="goBack">返回</button>
      <h1 class="title">社区问答</h1>
      <button class="btn btn-primary" @click="goToAsk">提问</button>
    </header>

    <main class="content">
      <!-- 分类筛选 -->
      <div class="category-filter">
        <button 
          class="category-btn" 
          :class="{ active: selectedCategory === null }"
          @click="selectCategory(null)"
        >
          全部
        </button>
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="category-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 置顶问题 -->
      <div v-if="pinnedQuestions.length > 0" class="pinned-section">
        <h2 class="section-title">置顶问题</h2>
        <div class="question-list">
          <div 
            v-for="question in pinnedQuestions" 
            :key="question.id"
            class="question-card pinned"
            @click="goToDetail(question.id)"
          >
            <div class="question-header">
              <span class="pin-badge">置顶</span>
              <span class="category-tag">{{ question.categoryName }}</span>
            </div>
            <h3 class="question-title">{{ question.title }}</h3>
            <p class="question-content">{{ truncateContent(question.content) }}</p>
            <div class="question-footer">
              <span class="author">{{ question.username }}</span>
              <span class="stats">
                <span class="stat-item">👁 {{ question.viewCount }}</span>
                <span class="stat-item">💬 {{ question.answerCount }}</span>
                <span class="stat-item">👍 {{ question.likeCount }}</span>
              </span>
              <span class="time">{{ formatDate(question.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 问题列表 -->
      <div class="questions-section">
        <h2 class="section-title">最新问题</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="questions.length === 0" class="empty">暂无问题</div>
        <div v-else class="question-list">
          <div 
            v-for="question in filteredQuestions" 
            :key="question.id"
            class="question-card"
            @click="goToDetail(question.id)"
          >
            <div class="question-header">
              <span class="category-tag">{{ question.categoryName }}</span>
              <span v-if="question.isResolved" class="resolved-badge">已解决</span>
            </div>
            <h3 class="question-title">{{ question.title }}</h3>
            <p class="question-content">{{ truncateContent(question.content) }}</p>
            <div class="question-footer">
              <span class="author">{{ question.username }}</span>
              <span class="stats">
                <span class="stat-item">👁 {{ question.viewCount }}</span>
                <span class="stat-item">💬 {{ question.answerCount }}</span>
                <span class="stat-item">👍 {{ question.likeCount }}</span>
              </span>
              <span class="time">{{ formatDate(question.createdAt) }}</span>
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
  name: 'CommunityPage',
  data() {
    return {
      categories: [],
      questions: [],
      pinnedQuestions: [],
      selectedCategory: null,
      loading: false
    }
  },
  computed: {
    filteredQuestions() {
      if (this.selectedCategory === null) {
        return this.questions
      }
      return this.questions.filter(q => q.categoryId === this.selectedCategory)
    }
  },
  async created() {
    await this.fetchCategories()
    await this.fetchQuestions()
    await this.fetchPinnedQuestions()
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await request.get('/api/community/categories')
        if (res.data && res.data.code === 200) {
          this.categories = res.data.data || []
        }
      } catch (e) {
        console.error('获取分类失败', e)
      }
    },
    async fetchQuestions() {
      this.loading = true
      try {
        const res = await request.get('/api/community/questions')
        if (res.data && res.data.code === 200) {
          this.questions = res.data.data || []
        }
      } catch (e) {
        console.error('获取问题列表失败', e)
      } finally {
        this.loading = false
      }
    },
    async fetchPinnedQuestions() {
      try {
        const res = await request.get('/api/community/questions/pinned')
        if (res.data && res.data.code === 200) {
          this.pinnedQuestions = res.data.data || []
        }
      } catch (e) {
        console.error('获取置顶问题失败', e)
      }
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },
    truncateContent(content) {
      if (!content) return ''
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    goToDetail(id) {
      this.$router.push(`/community/questions/${id}`)
    },
    goToAsk() {
      this.$router.push('/community/ask')
    },
    goBack() {
      // 根据用户类型跳转到对应主页
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const userType = userInfo.userType
        if (userType === 2) {
          this.$router.push('/host')
        } else if (userType === 3) {
          this.$router.push('/admin')
        } else {
          this.$router.push('/dashboard')
        }
      } catch (e) {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.community-page {
  min-height: 100vh;
  background: #f3f4f6;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: #111827;
  color: #f9fafb;
}

.title {
  margin: 0;
  font-size: 24px;
}

.content {
  padding: 24px 40px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.category-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  background: #f3f4f6;
}

.category-btn.active {
  background: #111827;
  color: #f9fafb;
  border-color: #111827;
}

.section-title {
  font-size: 18px;
  color: #111827;
  margin: 0 0 16px;
}

.pinned-section {
  margin-bottom: 32px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

.question-card.pinned {
  border-left: 4px solid #f59e0b;
}

.question-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.pin-badge {
  padding: 2px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 12px;
}

.category-tag {
  padding: 2px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  font-size: 12px;
}

.resolved-badge {
  padding: 2px 8px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 4px;
  font-size: 12px;
}

.question-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

.question-content {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #9ca3af;
}

.author {
  color: #3b82f6;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-outline {
  background: transparent;
  color: #f9fafb;
  border-color: #f9fafb;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: #f9fafb;
  color: #111827;
  border-color: #f9fafb;
}

.btn-primary:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
}
</style>
