<template>
  <div class="admin-refund-review">
    <header class="header">
      <h1 class="title">退款审核</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="refunds.length === 0" class="empty">暂无待审核的退款申请</div>
      
      <div v-else class="refund-list">
        <div 
          v-for="refund in refunds" 
          :key="refund.id"
          class="refund-card"
        >
          <div class="refund-header">
            <h2>退款申请 #{{ refund.id }}</h2>
            <span class="refund-status">退款中</span>
          </div>
          
          <div class="refund-info">
            <div class="info-item">
              <span class="label">用户ID：</span>
              <span>{{ refund.userId }}</span>
            </div>
            <div class="info-item">
              <span class="label">预约ID：</span>
              <span>{{ refund.bookingId }}</span>
            </div>
            <div class="info-item">
              <span class="label">退款金额：</span>
              <span class="amount">￥{{ refund.amount }}</span>
            </div>
            <div class="info-item">
              <span class="label">退款原因类型：</span>
              <span>{{ getRefundReasonTypeText(refund.refundReasonType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">是否不可抗力：</span>
              <span>{{ refund.isForceMajeure ? '是' : '否' }}</span>
            </div>
            <div class="info-item">
              <span class="label">违约金：</span>
              <span class="penalty">￥{{ refund.penaltyAmount || 0 }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">退款原因：</span>
              <span>{{ refund.refundReason }}</span>
            </div>
            <div class="info-item full-width" v-if="refund.proofMaterialUrl">
              <span class="label">证明材料：</span>
              <a :href="refund.proofMaterialUrl" target="_blank" class="proof-link">查看证明材料</a>
            </div>
            <div class="info-item">
              <span class="label">申请时间：</span>
              <span>{{ formatDate(refund.createdAt) }}</span>
            </div>
          </div>
          
          <div class="refund-actions">
            <div class="reject-section" v-if="showRejectForm === refund.id">
              <textarea 
                v-model="rejectReason" 
                placeholder="请输入驳回原因" 
                rows="3"
                class="reject-reason"
              ></textarea>
              <div class="reject-buttons">
                <button class="btn btn-outline" @click="cancelReject">取消</button>
                <button class="btn btn-primary" @click="processRefund(refund.id, false)">确认驳回</button>
              </div>
            </div>
            
            <div v-else class="action-buttons">
              <button 
                class="btn btn-primary" 
                @click="processRefund(refund.id, true)"
                :disabled="processing.includes(refund.id)"
              >
                {{ processing.includes(refund.id) ? '处理中...' : '审核通过' }}
              </button>
              <button 
                class="btn btn-outline" 
                @click="showRejectForm = refund.id"
                :disabled="processing.includes(refund.id)"
              >
                {{ processing.includes(refund.id) ? '处理中...' : '审核驳回' }}
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
  name: 'AdminRefundReviewPage',
  data() {
    return {
      refunds: [],
      loading: false,
      error: null,
      processing: [],
      showRejectForm: null,
      rejectReason: ''
    }
  },
  async created() {
    await this.fetchRefunds()
  },
  methods: {
    async fetchRefunds() {
      this.loading = true
      this.error = null
      try {
        const res = await request.get('/api/admin/refunds/pending')
        if (res.data && res.data.code === 200) {
          this.refunds = res.data.data || []
        } else {
          this.error = res.data?.message || '获取待审核退款失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取待审核退款失败'
      } finally {
        this.loading = false
      }
    },
    async processRefund(paymentId, approve) {
      this.processing.push(paymentId)
      try {
        const res = await request.post(`/api/admin/refunds/${paymentId}/process`, {
          approve,
          rejectReason: !approve ? this.rejectReason : undefined
        })
        if (res.data && res.data.code === 200) {
          alert(approve ? '退款审核通过' : '退款审核驳回')
          this.showRejectForm = null
          this.rejectReason = ''
          await this.fetchRefunds()
        } else {
          alert(res.data?.message || '审核操作失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '审核操作失败')
      } finally {
        this.processing = this.processing.filter(id => id !== paymentId)
      }
    },
    getRefundReasonTypeText(type) {
      const types = {
        1: '用户原因',
        2: '房东原因',
        3: '平台原因',
        4: '不可抗力'
      }
      return types[type] || '未知'
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    cancelReject() {
      this.showRejectForm = null
      this.rejectReason = ''
    },
    goBack() {
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.admin-refund-review {
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

.refund-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.refund-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.refund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.refund-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
  flex: 1;
}

.refund-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #fbbf24;
  color: #78350f;
}

.refund-info {
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

.amount {
  font-weight: 600;
  color: #10b981;
}

.penalty {
  font-weight: 600;
  color: #ef4444;
}

.proof-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.proof-link:hover {
  text-decoration: underline;
}

.refund-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.reject-section {
  margin-bottom: 16px;
}

.reject-reason {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}

.reject-buttons {
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
  
  .refund-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons,
  .reject-buttons {
    flex-direction: column;
  }
}
</style>