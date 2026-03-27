<template>
  <div class="question-detail">
    <header class="header">
      <button class="btn btn-outline" @click="goBack">返回社区</button>
      <h1 class="title">问题详情</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!question" class="error">问题不存在</div>
      <div v-else>
        <!-- 问题内容 -->
        <div class="question-section">
          <div class="question-header">
            <span class="category-tag">{{ question.categoryName }}</span>
            <span v-if="question.isResolved" class="resolved-badge">已解决</span>
          </div>
          <h1 class="question-title">{{ question.title }}</h1>
          <div class="question-meta">
            <span class="author">{{ question.username }}</span>
            <span class="time">{{ formatDateTime(question.createdAt) }}</span>
            <button v-if="canDeleteQuestion" class="delete-btn" @click="deleteQuestion">删除问题</button>
            <button class="report-btn" @click.stop="showReportModal(1, question.id)">举报</button>
          </div>
          <div class="question-content">{{ question.content }}</div>
          <div class="question-stats">
            <span class="stat-item">👁 {{ question.viewCount }} 浏览</span>
            <span class="stat-item">💬 {{ question.answerCount }} 回答</span>
            <button class="like-btn" :class="{ liked: questionLiked }" @click="likeQuestion">
              {{ questionLiked ? '❤️' : '🤍' }} {{ question.likeCount }}
            </button>
            <button class="favorite-btn" :class="{ favorited: questionFavorited }" @click="toggleFavorite">
              {{ questionFavorited ? '⭐' : '☆' }} {{ questionFavorited ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>

        <!-- 回答列表 -->
        <div class="answers-section">
          <h2 class="section-title">
            {{ answers.length }} 个回答
            <button v-if="canAnswer" class="btn btn-primary btn-small" @click="showAnswerForm = true">
              写回答
            </button>
          </h2>

          <!-- 回答表单 -->
          <div v-if="showAnswerForm" class="answer-form">
            <textarea
              v-model="answerContent"
              rows="4"
              placeholder="写下你的回答..."
            ></textarea>
            <div class="form-actions">
              <button class="btn btn-outline" @click="showAnswerForm = false">取消</button>
              <button class="btn btn-primary" :disabled="!answerContent.trim() || submitting" @click="submitAnswer">
                {{ submitting ? '提交中...' : '提交回答' }}
              </button>
            </div>
          </div>

          <!-- 回答列表 -->
          <div v-if="answers.length === 0" class="empty">暂无回答，快来抢沙发吧！</div>
          <div v-else class="answer-list">
            <div 
              v-for="answer in rootAnswers" 
              :key="answer.id"
              class="answer-card"
              :class="{ accepted: answer.isAccepted }"
            >
              <div v-if="answer.isAccepted" class="accepted-badge">✓ 已采纳</div>
              <div class="answer-header">
                <span class="author">{{ answer.username }}</span>
                <span class="time">{{ formatDateTime(answer.createdAt) }}</span>
              </div>
              <div class="answer-content">{{ answer.content }}</div>
              <div class="answer-actions">
                <button class="action-btn" :class="{ liked: answer.userLiked }" @click="likeAnswer(answer)">
                  {{ answer.userLiked ? '❤️' : '🤍' }} {{ answer.likeCount }}
                </button>
                <button class="action-btn" @click="replyTo(answer)">
                  回复
                </button>
                <button 
                  v-if="canAccept(answer)" 
                  class="action-btn accept-btn"
                  @click="acceptAnswer(answer.id)"
                >
                  采纳
                </button>
                <button 
                  v-if="canDeleteAnswer(answer)" 
                  class="action-btn delete-btn"
                  @click="deleteAnswer(answer.id)"
                >
                  删除
                </button>
                <button class="action-btn report-btn" @click.stop="showReportModal(2, answer.id)">
                  举报
                </button>
              </div>
              
              <!-- 子回复列表 -->
              <div v-if="getReplies(answer.id).length > 0" class="reply-list">
                <div 
                  v-for="reply in getReplies(answer.id)" 
                  :key="reply.id"
                  class="reply-card"
                >
                  <div class="reply-header">
                    <span class="author">{{ reply.username }}</span>
                    <span class="reply-to">回复</span>
                    <span class="author">{{ reply.parentUsername }}</span>
                    <span class="time">{{ formatDateTime(reply.createdAt) }}</span>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                  <div class="reply-actions">
                    <button class="action-btn" @click="replyTo(reply)">
                      回复
                    </button>
                    <button 
                      v-if="canDeleteAnswer(reply)" 
                      class="action-btn delete-btn"
                      @click="deleteAnswer(reply.id)"
                    >
                      删除
                    </button>
                    <button class="action-btn report-btn" @click.stop="showReportModal(2, reply.id)">
                      举报
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 回复输入框 -->
              <div v-if="replyingTo && replyingTo.id === answer.id" class="reply-form-inline">
                <textarea
                  v-model="replyContent"
                  rows="3"
                  :placeholder="`回复 ${answer.username}...`"
                ></textarea>
                <div class="form-actions">
                  <button class="btn btn-outline" @click="cancelReply">取消</button>
                  <button class="btn btn-primary" :disabled="!replyContent.trim() || submitting" @click="submitReply">
                    {{ submitting ? '提交中...' : '提交回复' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 举报弹窗 -->
    <div v-if="showReportDialog" class="modal-overlay" @click.self="closeReportModal">
      <div class="modal">
        <h3 class="modal-title">举报内容</h3>
        <div class="modal-body">
          <label>举报类型 *</label>
          <select v-model="reportForm.reportType">
            <option :value="1">垃圾广告</option>
            <option :value="2">虚假信息</option>
            <option :value="3">不当内容</option>
            <option :value="4">侵权内容</option>
            <option :value="5">其他</option>
          </select>
          <label>举报原因</label>
          <textarea
            v-model="reportForm.reason"
            rows="3"
            placeholder="请详细描述举报原因（可选）"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeReportModal">取消</button>
          <button class="btn btn-primary" @click="submitReport">提交举报</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'QuestionDetailPage',
  data() {
    return {
      question: null,
      answers: [],
      loading: false,
      showAnswerForm: false,
      answerContent: '',
      submitting: false,
      currentUser: null,
      showReportDialog: false,
      replyingTo: null,
      replyContent: '',
      questionLiked: false,
      questionFavorited: false,
      reportForm: {
        targetType: 1,
        targetId: null,
        reportType: 1,
        reason: ''
      }
    }
  },
  computed: {
    questionId() {
      return this.$route.params.id
    },
    canAnswer() {
      return this.currentUser && this.question && this.question.questionStatus === 1
    },
    // 一级回答（parentId为null）
    rootAnswers() {
      return this.answers.filter(a => !a.parentId)
    },
    // 是否可以删除问题（问题发布者）
    canDeleteQuestion() {
      return this.currentUser && this.question && this.question.userId === this.currentUser.id
    }
  },
  async created() {
    await this.fetchCurrentUser()
    await this.fetchQuestionDetail()
    await this.fetchAnswers()
    await this.fetchQuestionLikeStatus()
    await this.fetchQuestionFavoriteStatus()
    await this.fetchAnswersLikeStatus()
  },
  methods: {
    async fetchCurrentUser() {
      try {
        const res = await request.get('/api/user/profile')
        if (res.data && res.data.code === 200) {
          this.currentUser = res.data.data
        }
      } catch (e) {
        console.error('获取用户信息失败', e)
      }
    },
    async fetchQuestionDetail() {
      this.loading = true
      try {
        const res = await request.get(`/api/community/questions/${this.questionId}`)
        if (res.data && res.data.code === 200) {
          this.question = res.data.data
        }
      } catch (e) {
        console.error('获取问题详情失败', e)
      } finally {
        this.loading = false
      }
    },
    async fetchAnswers() {
      try {
        const res = await request.get(`/api/community/questions/${this.questionId}/answers`)
        if (res.data && res.data.code === 200) {
          this.answers = res.data.data || []
        }
      } catch (e) {
        console.error('获取回答列表失败', e)
      }
    },
    async submitAnswer() {
      if (!this.answerContent.trim()) return
      
      this.submitting = true
      try {
        const res = await request.post('/api/community/answers', {
          questionId: this.questionId,
          content: this.answerContent
        })
        if (res.data && res.data.code === 200) {
          const result = res.data.data
          const hasSensitiveWords = result && result.answerStatus === 3
          if (hasSensitiveWords) {
            alert('回答提交成功，内容包含敏感词需管理员审核后发布')
          } else {
            alert('回答发布成功！')
          }
          this.answerContent = ''
          this.showAnswerForm = false
          await this.fetchAnswers()
        } else {
          alert(res.data?.message || '提交失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '提交失败')
      } finally {
        this.submitting = false
      }
    },
    canDeleteAnswer(answer) {
      return this.currentUser && answer.userId === this.currentUser.id
    },
    async deleteQuestion() {
      if (!confirm('确定要删除这个问题吗？删除后无法恢复。')) return
      
      try {
        const res = await request.delete(`/api/community/questions/${this.questionId}`)
        if (res.data && res.data.code === 200) {
          alert('删除成功')
          this.$router.push('/community')
        } else {
          alert(res.data?.message || '删除失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '删除失败')
      }
    },
    async deleteAnswer(answerId) {
      if (!confirm('确定要删除这条回答吗？')) return
      
      try {
        const res = await request.delete(`/api/community/answers/${answerId}`)
        if (res.data && res.data.code === 200) {
          alert('删除成功')
          await this.fetchAnswers()
        } else {
          alert(res.data?.message || '删除失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '删除失败')
      }
    },
    async likeAnswer(answer) {
      if (!this.currentUser) {
        alert('请先登录')
        return
      }
      try {
        const res = await request.post(`/api/community/answers/${answer.id}/like`)
        if (res.data && res.data.code === 200) {
          answer.userLiked = res.data.data.liked
          answer.likeCount = res.data.data.likeCount
        } else {
          console.error('操作失败:', res.data?.message)
        }
      } catch (e) {
        console.error('操作失败', e)
      }
    },
    async fetchQuestionLikeStatus() {
      if (!this.currentUser) return
      try {
        const res = await request.get(`/api/community/questions/${this.questionId}/like`)
        if (res.data && res.data.code === 200) {
          this.questionLiked = res.data.data.hasLiked
        }
      } catch (e) {
        console.error('获取点赞状态失败', e)
      }
    },
    async fetchAnswersLikeStatus() {
      if (!this.currentUser || this.answers.length === 0) return
      try {
        const answerIds = this.answers.map(a => a.id)
        // 批量查询点赞状态
        const likedAnswers = await Promise.all(
          answerIds.map(async id => {
            try {
              const res = await request.get(`/api/community/answers/${id}/like`)
              return res.data?.code === 200 && res.data.data.hasLiked ? id : null
            } catch (e) {
              return null
            }
          })
        )
        // 更新每个回答的点赞状态
        this.answers.forEach(answer => {
          answer.userLiked = likedAnswers.includes(answer.id)
        })
      } catch (e) {
        console.error('获取回答点赞状态失败', e)
      }
    },
    async likeQuestion() {
      if (!this.currentUser) {
        alert('请先登录')
        return
      }
      try {
        const res = await request.post(`/api/community/questions/${this.questionId}/like`)
        if (res.data && res.data.code === 200) {
          this.questionLiked = res.data.data.liked
          this.question.likeCount = res.data.data.likeCount
        } else {
          console.error('操作失败:', res.data?.message)
        }
      } catch (e) {
        console.error('操作失败', e)
      }
    },
    async fetchQuestionFavoriteStatus() {
      if (!this.currentUser) return
      try {
        const res = await request.get(`/api/community/questions/${this.questionId}/favorite`)
        if (res.data && res.data.code === 200) {
          this.questionFavorited = res.data.data.hasFavorited
        }
      } catch (e) {
        console.error('获取收藏状态失败', e)
      }
    },
    async toggleFavorite() {
      if (!this.currentUser) {
        alert('请先登录')
        return
      }
      try {
        const res = await request.post(`/api/community/questions/${this.questionId}/favorite`)
        if (res.data && res.data.code === 200) {
          this.questionFavorited = res.data.data.favorited
        } else {
          console.error('操作失败:', res.data?.message)
        }
      } catch (e) {
        console.error('操作失败', e)
      }
    },
    async acceptAnswer(answerId) {
      try {
        const res = await request.post(`/api/community/answers/${answerId}/accept`)
        if (res.data && res.data.code === 200) {
          alert('采纳成功')
          await this.fetchQuestionDetail()
          await this.fetchAnswers()
        } else {
          alert(res.data?.message || '采纳失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '采纳失败')
      }
    },
    canAccept(answer) {
      return this.currentUser && 
             this.question && 
             this.question.userId === this.currentUser.id && 
             !answer.isAccepted &&
             answer.userId !== this.currentUser.id
    },
    // 获取某个回答的子回复
    getReplies(parentId) {
      return this.answers.filter(a => a.parentId === parentId)
    },
    replyTo(answer) {
      this.replyingTo = answer
      this.replyContent = ''
    },
    cancelReply() {
      this.replyingTo = null
      this.replyContent = ''
    },
    async submitReply() {
      if (!this.replyContent.trim() || !this.replyingTo) return
      
      this.submitting = true
      try {
        const res = await request.post('/api/community/answers', {
          questionId: this.questionId,
          content: this.replyContent.trim(),
          parentId: this.replyingTo.id
        })
        if (res.data && res.data.code === 200) {
          const result = res.data.data
          const hasSensitiveWords = result && result.answerStatus === 3
          if (hasSensitiveWords) {
            alert('回复提交成功，内容包含敏感词需管理员审核后发布')
          } else {
            alert('回复发布成功！')
          }
          this.replyContent = ''
          this.replyingTo = null
          await this.fetchAnswers()
        } else {
          alert(res.data?.message || '提交失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '提交失败')
      } finally {
        this.submitting = false
      }
    },
    showReportModal(targetType, targetId) {
      this.reportForm = {
        targetType,
        targetId,
        reportType: 1,
        reason: ''
      }
      this.showReportDialog = true
    },
    closeReportModal() {
      this.showReportDialog = false
    },
    async submitReport() {
      try {
        const res = await request.post('/api/community/reports', {
          targetType: this.reportForm.targetType,
          targetId: this.reportForm.targetId,
          reportType: this.reportForm.reportType,
          reason: this.reportForm.reason
        })
        if (res.data && res.data.code === 200) {
          alert('举报提交成功，我们会尽快处理')
          this.closeReportModal()
        } else {
          alert(res.data?.message || '举报失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '举报失败')
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    goBack() {
      this.$router.push('/community')
    }
  }
}
</script>

<style scoped>
.question-detail {
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
  max-width: 900px;
  margin: 0 auto;
}

.question-section {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.question-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.category-tag {
  padding: 4px 12px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 12px;
  font-size: 12px;
}

.resolved-badge {
  padding: 4px 12px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 12px;
  font-size: 12px;
}

.question-title {
  margin: 0 0 12px;
  font-size: 22px;
  color: #111827;
  font-weight: 600;
}

.question-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.author {
  color: #3b82f6;
  font-weight: 500;
}

.question-content {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 16px;
}

.question-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-btn:hover:not(:disabled) {
  color: #92400e;
}

.like-btn.liked {
  color: #92400e;
}

.like-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.favorite-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.favorite-btn:hover:not(:disabled) {
  color: #854d0e;
}

.favorite-btn.favorited {
  color: #854d0e;
}

.answers-section {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 20px;
  font-size: 18px;
  color: #111827;
}

.answer-form {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.answer-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  position: relative;
}

.answer-card.accepted {
  border-color: #16a34a;
  background: #f0fdf4;
}

.accepted-badge {
  position: absolute;
  top: -8px;
  right: 16px;
  padding: 2px 8px;
  background: #16a34a;
  color: #ffffff;
  border-radius: 4px;
  font-size: 12px;
}

.answer-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.answer-content {
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 12px;
}

.answer-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s ease;
}

.action-btn:hover {
  color: #3b82f6;
}

.action-btn.liked {
  color: #ef4444;
}

.action-btn.liked:hover {
  color: #dc2626;
}

.action-btn.accept-btn {
  color: #16a34a;
}

.action-btn.accept-btn:hover {
  color: #15803d;
}

/* 子回复列表样式 */
.reply-list {
  margin-top: 16px;
  padding-left: 16px;
  border-left: 3px solid #e5e7eb;
}

.reply-card {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.reply-card:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6b7280;
}

.reply-to {
  color: #9ca3af;
  font-size: 12px;
}

.reply-content {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 8px;
}

.reply-actions {
  display: flex;
  gap: 12px;
}

.reply-actions .action-btn {
  font-size: 13px;
  padding: 2px 8px;
}

/* 内联回复表单 */
.reply-form-inline {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.reply-form-inline textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 10px;
}

.loading, .error, .empty {
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

.btn-primary {
  background: #111827;
  color: #f9fafb;
  border-color: #111827;
}

.btn-primary:hover {
  background: #1f2937;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.report-btn {
  color: #9ca3af;
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.delete-btn {
  color: #9ca3af;
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.action-btn.delete-btn {
  color: #ef4444;
}

.action-btn.delete-btn:hover {
  color: #dc2626;
}

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
  max-width: 400px;
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

.modal-body select,
.modal-body textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-body textarea {
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
}
</style>
