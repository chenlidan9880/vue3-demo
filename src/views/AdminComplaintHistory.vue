<template>
  <div class="admin-complaint-history">
    <header class="header">
      <h1 class="title">投诉历史</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="complaints.length === 0" class="empty">暂无投诉记录</div>
      
      <div v-else class="complaints-list">
        <div 
          v-for="complaint in complaints" 
          :key="complaint.id"
          class="complaint-card"
        >
          <div class="complaint-header">
            <div class="complaint-info">
              <h3 class="complaint-title">投诉 #{{ complaint.id }}</h3>
              <span class="complaint-type">{{ getComplaintTypeText(complaint.complaintType) }}</span>
            </div>
            <span 
              class="status-tag" 
              :class="`status-${complaint.status}`"
            >
              {{ getStatusText(complaint.status) }}
            </span>
          </div>
          
          <div class="complaint-details">
            <div class="detail-item">
              <span class="label">租客：</span>
              <span>{{ complaint.guestUsername }}</span>
            </div>
            <div class="detail-item">
              <span class="label">房东：</span>
              <span>{{ complaint.ownerUsername }}</span>
            </div>
            <div class="detail-item">
              <span class="label">房源：</span>
              <span>{{ complaint.propertyTitle }}</span>
            </div>
            <div class="detail-item">
              <span class="label">投诉时间：</span>
              <span>{{ formatDateTime(complaint.createdAt) }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="label">投诉内容：</span>
              <p class="content">{{ complaint.content }}</p>
            </div>
            <div class="detail-item full-width" v-if="complaint.proofImages">
              <span class="label">凭证图片：</span>
              <div class="proof-images">
                <a 
                  v-for="(url, index) in complaint.proofImages.split(',')" 
                  :key="index"
                  :href="url.trim()" 
                  target="_blank"
                  class="proof-link"
                >
                  查看图片{{ index + 1 }}
                </a>
              </div>
            </div>
          </div>
          
          <!-- 处理结果 -->
          <div class="handle-result" v-if="complaint.status === 2 || complaint.status === 3">
            <div class="result-header">
              <span class="result-label">处理结果</span>
              <span class="handle-time">{{ formatDateTime(complaint.handledAt) }}</span>
            </div>
            <div class="result-details">
              <div class="detail-item">
                <span class="label">处理管理员：</span>
                <span>{{ complaint.adminUsername }}</span>
              </div>
              <div v-if="complaint.status === 2">
                <div class="detail-item full-width">
                  <span class="label">处理措施：</span>
                  <p class="result-content">{{ complaint.handleResult }}</p>
                </div>
                <div class="result-tip success">
                  <span class="tip-icon">✅</span>
                  <span>投诉已成立，已对房东/房源采取相应措施</span>
                </div>
              </div>
              <div v-else-if="complaint.status === 3">
                <div class="detail-item full-width">
                  <span class="label">驳回原因：</span>
                  <p class="result-content reject">{{ complaint.rejectReason }}</p>
                </div>
                <div class="result-tip reject">
                  <span class="tip-icon">❌</span>
                  <span>投诉已被驳回</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 待处理/处理中 -->
          <div class="pending-actions" v-if="complaint.status === 0 || complaint.status === 1">
            <button 
              class="btn btn-primary" 
              @click="goToReview(complaint.id)"
            >
              {{ complaint.status === 0 ? '处理投诉' : '继续处理' }}
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
  name: 'AdminComplaintHistoryPage',
  data() {
    return {
      complaints: [],
      loading: false,
      error: null
    }
  },
  async created() {
    await this.fetchComplaints()
  },
  methods: {
    async fetchComplaints() {
      this.loading = true
      this.error = null
      try {
        const res = await request.get('/api/admin/complaints/history')
        if (res.data && res.data.code === 200) {
          this.complaints = res.data.data || []
        } else {
          this.error = res.data?.message || '获取投诉列表失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取投诉列表失败'
      } finally {
        this.loading = false
      }
    },
    getComplaintTypeText(type) {
      const types = {
        1: '房源信息虚假',
        2: '设施损坏',
        3: '房东服务差',
        4: '卫生问题',
        5: '其他'
      }
      return types[type] || '未知'
    },
    getStatusText(status) {
      const statuses = {
        0: '待处理',
        1: '处理中',
        2: '已成立',
        3: '已驳回'
      }
      return statuses[status] || '未知'
    },
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    goToReview(complaintId) {
      this.$router.push(`/admin/complaints/review?complaintId=${complaintId}`)
    },
    goBack() {
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.admin-complaint-history {
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
}

.loading, .error, .empty {
  background: #ffffff;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.complaints-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.complaint-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom:1px solid #e5e7eb;
}

.complaint-info {
  flex: 1;
}

.complaint-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.complaint-type {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-0 {
  background: #fef3c7;
  color: #92400e;
}

.status-1 {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-2 {
  background: #dcfce7;
  color: #16a34a;
}

.status-3 {
  background: #fee2e2;
  color: #b91c1c;
}

.complaint-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
}

.detail-item.full-width {
  flex-direction: column;
}

.label {
  min-width: 100px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.detail-item span:not(.label) {
  font-size: 14px;
  color: #374151;
}

.content {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.proof-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.proof-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 6px;
}

.proof-link:hover {
  text-decoration: underline;
  background: #e5e7eb;
}

.handle-result {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.result-label {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.handle-time {
  font-size: 12px;
  color: #6b7280;
}

.result-details {
  margin-top: 12px;
}

.result-content {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
}

.result-content.reject {
  color: #b91c1c;
}

.result-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #ffffff;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;
}

.result-tip.success {
  background: #f0fdf4;
  color: #16a34a;
}

.result-tip.reject {
  background: #fef2f2;
  color: #b91c1c;
}

.tip-icon {
  font-size: 16px;
}

.pending-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
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

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
}
</style>
