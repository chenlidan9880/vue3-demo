<template>
  <div class="admin-complaint-review">
    <header class="header">
      <h1 class="title">投诉审核</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="complaints.length === 0" class="empty">暂无待处理的投诉</div>
      
      <div v-else class="complaint-list">
        <div 
          v-for="complaint in complaints" 
          :key="complaint.id"
          class="complaint-card"
        >
          <div class="complaint-header">
            <h2>投诉 #{{ complaint.id }}</h2>
            <span class="complaint-status">{{ getStatusText(complaint.status) }}</span>
          </div>
          
          <div class="complaint-info">
            <div class="info-item">
              <span class="label">投诉类型：</span>
              <span>{{ getComplaintTypeText(complaint.complaintType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">租客：</span>
              <span>{{ complaint.guestUsername }}</span>
            </div>
            <div class="info-item">
              <span class="label">房东：</span>
              <span>{{ complaint.ownerUsername }}</span>
            </div>
            <div class="info-item">
              <span class="label">房源：</span>
              <span>{{ complaint.propertyTitle }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">投诉内容：</span>
              <span>{{ complaint.content }}</span>
            </div>
            <div class="info-item full-width" v-if="complaint.proofImages">
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
            <div class="info-item">
              <span class="label">投诉时间：</span>
              <span>{{ formatDate(complaint.createdAt) }}</span>
            </div>
          </div>
          
          <div class="complaint-actions">
            <!-- 处理表单 -->
            <div v-if="showHandleForm === complaint.id" class="handle-section">
              <div v-if="handleType === 'valid'">
                <textarea 
                  v-model="handleResult" 
                  placeholder="请输入处理结果（如：警告房东、下架房源等）" 
                  rows="3"
                  class="handle-input"
                ></textarea>
                <div class="handle-buttons">
                  <button class="btn btn-outline" @click="cancelHandle">取消</button>
                  <button class="btn btn-primary" @click="processComplaint(complaint.id, true)">确认成立</button>
                </div>
              </div>
              <div v-else>
                <textarea 
                  v-model="rejectReason" 
                  placeholder="请输入驳回原因" 
                  rows="3"
                  class="handle-input"
                ></textarea>
                <div class="handle-buttons">
                  <button class="btn btn-outline" @click="cancelHandle">取消</button>
                  <button class="btn btn-primary" @click="processComplaint(complaint.id, false)">确认驳回</button>
                </div>
              </div>
            </div>
            
            <div v-else class="action-buttons">
              <button 
                class="btn btn-primary" 
                @click="showHandleForm = complaint.id; handleType = 'valid'"
                :disabled="processing.includes(complaint.id)"
              >
                {{ processing.includes(complaint.id) ? '处理中...' : '投诉成立' }}
              </button>
              <button 
                class="btn btn-outline" 
                @click="showHandleForm = complaint.id; handleType = 'reject'"
                :disabled="processing.includes(complaint.id)"
              >
                {{ processing.includes(complaint.id) ? '处理中...' : '投诉驳回' }}
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
  name: 'AdminComplaintReviewPage',
  data() {
    return {
      complaints: [],
      loading: false,
      error: null,
      processing: [],
      showHandleForm: null,
      handleType: '',
      handleResult: '',
      rejectReason: ''
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
        const res = await request.get('/api/admin/complaints/pending')
        if (res.data && res.data.code === 200) {
          this.complaints = res.data.data || []
        } else {
          this.error = res.data?.message || '获取待处理投诉失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取待处理投诉失败'
      } finally {
        this.loading = false
      }
    },
    async processComplaint(complaintId, isValid) {
      this.processing.push(complaintId)
      try {
        const params = new URLSearchParams()
        params.append('isValid', isValid)
        if (isValid) {
          params.append('handleResult', this.handleResult)
        } else {
          params.append('rejectReason', this.rejectReason)
        }

        const res = await request.post(`/api/admin/complaints/${complaintId}/handle?${params.toString()}`)
        if (res.data && res.data.code === 200) {
          alert(isValid ? '投诉已成立' : '投诉已驳回')
          this.cancelHandle()
          await this.fetchComplaints()
        } else {
          alert(res.data?.message || '处理投诉失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '处理投诉失败')
      } finally {
        this.processing = this.processing.filter(id => id !== complaintId)
      }
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
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    cancelHandle() {
      this.showHandleForm = null
      this.handleType = ''
      this.handleResult = ''
      this.rejectReason = ''
    },
    goBack() {
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.admin-complaint-review {
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
  max-width: 600px;
  margin: 0 auto;
}

.complaint-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.complaint-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.complaint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.complaint-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
  flex: 1;
}

.complaint-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #fbbf24;
  color: #78350f;
}

.complaint-info {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-item span:not(.label) {
  font-size: 14px;
  color: #374151;
}

.proof-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.proof-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.proof-link:hover {
  text-decoration: underline;
}

.complaint-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.handle-section {
  margin-bottom: 16px;
}

.handle-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}

.handle-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 12px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
  
  .complaint-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons,
  .handle-buttons {
    flex-direction: column;
  }
}
</style>
