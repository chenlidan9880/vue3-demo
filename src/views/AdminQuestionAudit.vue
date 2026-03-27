<template>
  <div class="admin-question-audit">
    <header class="header">
      <h1 class="title">问题审核</h1>
    </header>

    <main class="content">
      <!-- 标签页 -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待审核
          <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部问题
        </button>
      </div>

      <!-- 待审核列表 -->
      <div v-if="activeTab === 'pending'" class="tab-content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="pendingQuestions.length === 0" class="empty">暂无待审核的问题</div>
        <div v-else class="question-list">
          <div 
            v-for="question in pendingQuestions" 
            :key="question.id"
            class="question-card"
          >
            <div class="question-header">
              <span class="category-tag">{{ question.categoryName }}</span>
              <span class="time">{{ formatDateTime(question.createdAt) }}</span>
            </div>
            <h3 class="question-title">{{ question.title }}</h3>
            <p class="question-content">{{ question.content }}</p>
            <div class="question-meta">
              <span class="author">提问者：{{ question.username }}</span>
            </div>
            <div class="audit-actions">
              <button class="btn btn-success" @click="approveQuestion(question.id)">
                通过
              </button>
              <button class="btn btn-danger" @click="showRejectModal(question)">
                驳回
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 全部问题列表 -->
      <div v-if="activeTab === 'all'" class="tab-content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="allQuestions.length === 0" class="empty">暂无问题</div>
        <div v-else class="question-list">
          <div 
            v-for="question in allQuestions" 
            :key="question.id"
            class="question-card"
            :class="{ pinned: question.isPinned }"
          >
            <div class="question-header">
              <span class="category-tag">{{ question.categoryName }}</span>
              <span class="status-tag" :class="`status-${question.questionStatus}`">
                {{ getStatusText(question.questionStatus) }}
              </span>
            </div>
            <h3 class="question-title">{{ question.title }}</h3>
            <p class="question-content">{{ truncateContent(question.content) }}</p>
            <div class="question-meta">
              <span class="author">提问者：{{ question.username }}</span>
              <span class="time">{{ formatDateTime(question.createdAt) }}</span>
            </div>
            <div v-if="question.questionStatus === 4" class="reject-reason">
              <strong>驳回原因：</strong>{{ question.rejectReason }}
            </div>
            <div class="audit-actions">
              <button 
                v-if="question.questionStatus === 1"
                class="btn btn-outline"
                @click="togglePin(question)"
              >
                {{ question.isPinned ? '取消置顶' : '置顶' }}
              </button>
              <button 
                v-if="question.questionStatus === 3"
                class="btn btn-success"
                @click="approveQuestion(question.id)"
              >
                通过
              </button>
              <button 
                v-if="question.questionStatus === 3"
                class="btn btn-danger"
                @click="showRejectModal(question)"
              >
                驳回
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 驳回弹窗 -->
    <div v-if="showRejectDialog" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal">
        <h3 class="modal-title">驳回问题</h3>
        <div class="modal-body">
          <label>驳回原因 *</label>
          <textarea
            v-model="rejectReason"
            rows="4"
            placeholder="请填写驳回原因，以便用户了解如何修改"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeRejectModal">取消</button>
          <button 
            class="btn btn-danger" 
            :disabled="!rejectReason.trim()"
            @click="rejectQuestion"
          >
            确认驳回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'AdminQuestionAuditPage',
  data() {
    return {
      activeTab: 'pending',
      pendingQuestions: [],
      allQuestions: [],
      loading: false,
      showRejectDialog: false,
      currentQuestion: null,
      rejectReason: ''
    }
  },
  computed: {
    pendingCount() {
      return this.pendingQuestions.length
    }
  },
  watch: {
    activeTab() {
      this.fetchData()
    }
  },
  async created() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        if (this.activeTab === 'pending') {
          await this.fetchPendingQuestions()
        } else {
          await this.fetchAllQuestions()
        }
      } finally {
        this.loading = false
      }
    },
    async fetchPendingQuestions() {
      try {
        const res = await request.get('/api/community/questions/pending')
        if (res.data && res.data.code === 200) {
          this.pendingQuestions = res.data.data || []
        }
      } catch (e) {
        console.error('获取待审核问题失败', e)
        alert('获取待审核问题失败')
      }
    },
    async fetchAllQuestions() {
      try {
        const res = await request.get('/api/community/questions/all')
        if (res.data && res.data.code === 200) {
          this.allQuestions = res.data.data || []
        }
      } catch (e) {
        console.error('获取全部问题失败', e)
        alert('获取全部问题失败')
      }
    },
    async approveQuestion(questionId) {
      try {
        const res = await request.post(`/api/community/questions/${questionId}/audit`, {
          status: 1
        })
        if (res.data && res.data.code === 200) {
          alert('审核通过')
          await this.fetchData()
        } else {
          alert(res.data?.message || '审核失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '审核失败')
      }
    },
    showRejectModal(question) {
      this.currentQuestion = question
      this.rejectReason = ''
      this.showRejectDialog = true
    },
    closeRejectModal() {
      this.showRejectDialog = false
      this.currentQuestion = null
      this.rejectReason = ''
    },
    async rejectQuestion() {
      if (!this.rejectReason.trim() || !this.currentQuestion) return

      try {
        const res = await request.post(`/api/community/questions/${this.currentQuestion.id}/audit`, {
          status: 4,
          rejectReason: this.rejectReason.trim()
        })
        if (res.data && res.data.code === 200) {
          alert('已驳回')
          this.closeRejectModal()
          await this.fetchData()
        } else {
          alert(res.data?.message || '驳回失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '驳回失败')
      }
    },
    async togglePin(question) {
      try {
        const isPinned = question.isPinned === 1 ? 0 : 1
        const res = await request.post(`/api/community/questions/${question.id}/pin`, {
          isPinned
        })
        if (res.data && res.data.code === 200) {
          alert(isPinned === 1 ? '置顶成功' : '取消置顶成功')
          await this.fetchData()
        } else {
          alert(res.data?.message || '操作失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '操作失败')
      }
    },
    getStatusText(status) {
      const statuses = {
        1: '已发布',
        2: '已删除',
        3: '待审核',
        4: '已驳回'
      }
      return statuses[status] || '未知'
    },
    truncateContent(content) {
      if (!content) return ''
      return content.length > 150 ? content.substring(0, 150) + '...' : content
    },
    formatDateTime(dateString) {
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
.admin-question-audit {
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
  max-width: 1200px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #111827;
  border-bottom-color: #111827;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  background: #ef4444;
  color: #ffffff;
  border-radius: 10px;
  font-size: 12px;
}

.tab-content {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.question-card.pinned {
  border-left: 4px solid #f59e0b;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-tag {
  padding: 4px 12px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-1 {
  background: #dcfce7;
  color: #16a34a;
}

.status-2 {
  background: #fee2e2;
  color: #b91c1c;
}

.status-3 {
  background: #fef3c7;
  color: #92400e;
}

.status-4 {
  background: #f3f4f6;
  color: #6b7280;
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

.question-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #9ca3af;
}

.reject-reason {
  padding: 12px;
  background: #fef2f2;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #b91c1c;
}

.audit-actions {
  display: flex;
  gap: 12px;
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
  color: #374151;
}

.btn-outline:hover {
  background: #f3f4f6;
}

.btn-success {
  background: #16a34a;
  color: #ffffff;
  border-color: #16a34a;
}

.btn-success:hover {
  background: #15803d;
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
}

.modal-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-body label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.modal-body textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
  
  .tabs {
    gap: 8px;
  }
  
  .tab-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
