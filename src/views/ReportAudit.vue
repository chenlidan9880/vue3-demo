<template>
  <div class="report-audit">
    <header class="header">
      <h1 class="title">举报审核</h1>
    </header>

    <main class="content">
      <!-- 标签页 -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待处理
          <span v-if="pendingCount > 0" class="badge">{{ pendingCount }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部记录
        </button>
      </div>

      <!-- 待处理列表 -->
      <div v-if="activeTab === 'pending'" class="tab-content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="pendingReports.length === 0" class="empty">暂无待处理的举报</div>
        <div v-else class="report-list">
          <div 
            v-for="report in pendingReports" 
            :key="report.id"
            class="report-card"
          >
            <div class="report-header">
              <span class="type-tag" :class="`type-${report.targetType}`">
                {{ report.targetType === 1 ? '问题' : '回答' }}
              </span>
              <span class="report-type">{{ getReportTypeName(report.reportType) }}</span>
              <span class="time">{{ formatDateTime(report.createdAt) }}</span>
            </div>
            
            <div class="report-body">
              <div class="report-info">
                <p><strong>举报人：</strong>{{ report.reporterName }}</p>
                <p v-if="report.reason"><strong>举报原因：</strong>{{ report.reason }}</p>
              </div>
              
              <div class="target-content">
                <p class="target-title">
                  <strong>{{ report.targetType === 1 ? '问题标题' : '回答内容' }}：</strong>
                  {{ report.targetTitle }}
                </p>
                <p class="target-preview">{{ truncateContent(report.targetContent, 200) }}</p>
                <p class="target-author"><strong>发布者：</strong>{{ report.targetAuthorName }}</p>
              </div>
            </div>
            
            <div class="report-actions">
              <button class="btn btn-danger" @click="handleReport(report, 1, true)">
                删除内容
              </button>
              <button class="btn btn-success" @click="handleReport(report, 1, false)">
                保留内容
              </button>
              <button class="btn btn-outline" @click="handleReport(report, 2, false)">
                无效举报
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 全部记录 -->
      <div v-if="activeTab === 'all'" class="tab-content">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="allReports.length === 0" class="empty">暂无举报记录</div>
        <div v-else class="report-list">
          <div 
            v-for="report in allReports" 
            :key="report.id"
            class="report-card"
            :class="{ processed: report.status !== 0 }"
          >
            <div class="report-header">
              <span class="type-tag" :class="`type-${report.targetType}`">
                {{ report.targetType === 1 ? '问题' : '回答' }}
              </span>
              <span class="report-type">{{ getReportTypeName(report.reportType) }}</span>
              <span class="status-tag" :class="`status-${report.status}`">
                {{ getStatusName(report.status) }}
              </span>
              <span class="time">{{ formatDateTime(report.createdAt) }}</span>
            </div>
            
            <div class="report-body">
              <div class="report-info">
                <p><strong>举报人：</strong>{{ report.reporterName }}</p>
                <p v-if="report.reason"><strong>举报原因：</strong>{{ report.reason }}</p>
              </div>
              
              <div class="target-content">
                <p class="target-title">
                  <strong>{{ report.targetType === 1 ? '问题标题' : '回答内容' }}：</strong>
                  {{ report.targetTitle }}
                </p>
                <p class="target-author"><strong>发布者：</strong>{{ report.targetAuthorName }}</p>
              </div>
              
              <div v-if="report.status !== 0" class="handle-info">
                <p><strong>处理人：</strong>{{ report.handlerName }}</p>
                <p><strong>处理结果：</strong>{{ report.handleResult || '无说明' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 处理弹窗 -->
    <div v-if="showHandleDialog" class="modal-overlay" @click.self="closeHandleDialog">
      <div class="modal">
        <h3 class="modal-title">处理举报</h3>
        <div class="modal-body">
          <label>处理结果说明</label>
          <textarea
            v-model="handleResult"
            rows="3"
            placeholder="请填写处理结果说明（可选）"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeHandleDialog">取消</button>
          <button class="btn btn-primary" @click="confirmHandle">确认处理</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'ReportAuditPage',
  data() {
    return {
      activeTab: 'pending',
      pendingReports: [],
      allReports: [],
      loading: false,
      showHandleDialog: false,
      currentReport: null,
      handleStatus: 1,
      deleteTarget: false,
      handleResult: ''
    }
  },
  computed: {
    pendingCount() {
      return this.pendingReports.length
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
          await this.fetchPendingReports()
        } else {
          await this.fetchAllReports()
        }
      } finally {
        this.loading = false
      }
    },
    async fetchPendingReports() {
      try {
        const res = await request.get('/api/community/reports/pending')
        if (res.data && res.data.code === 200) {
          this.pendingReports = res.data.data || []
        }
      } catch (e) {
        console.error('获取待处理举报失败', e)
      }
    },
    async fetchAllReports() {
      try {
        const res = await request.get('/api/community/reports/all')
        if (res.data && res.data.code === 200) {
          this.allReports = res.data.data || []
        }
      } catch (e) {
        console.error('获取全部举报失败', e)
      }
    },
    handleReport(report, status, deleteTarget) {
      this.currentReport = report
      this.handleStatus = status
      this.deleteTarget = deleteTarget
      this.handleResult = ''
      this.showHandleDialog = true
    },
    closeHandleDialog() {
      this.showHandleDialog = false
      this.currentReport = null
    },
    async confirmHandle() {
      if (!this.currentReport) return

      try {
        const res = await request.post(`/api/community/reports/${this.currentReport.id}/handle`, {
          status: this.handleStatus,
          handleResult: this.handleResult,
          deleteTarget: this.deleteTarget
        })
        if (res.data && res.data.code === 200) {
          alert('处理成功')
          this.closeHandleDialog()
          await this.fetchData()
        } else {
          alert(res.data?.message || '处理失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '处理失败')
      }
    },
    getReportTypeName(type) {
      const types = {
        1: '垃圾广告',
        2: '虚假信息',
        3: '不当内容',
        4: '侵权内容',
        5: '其他'
      }
      return types[type] || '未知'
    },
    getStatusName(status) {
      const statuses = {
        0: '待处理',
        1: '已处理-有效',
        2: '已处理-无效'
      }
      return statuses[status] || '未知'
    },
    truncateContent(content, maxLength) {
      if (!content) return ''
      return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
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
.report-audit {
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

.report-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.report-card.processed {
  opacity: 0.7;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.type-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.type-1 {
  background: #dbeafe;
  color: #1d4ed8;
}

.type-2 {
  background: #fef3c7;
  color: #92400e;
}

.report-type {
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 12px;
  color: #6b7280;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-0 {
  background: #fef3c7;
  color: #92400e;
}

.status-1 {
  background: #dcfce7;
  color: #16a34a;
}

.status-2 {
  background: #f3f4f6;
  color: #6b7280;
}

.time {
  margin-left: auto;
  font-size: 13px;
  color: #9ca3af;
}

.report-body {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 16px;
}

.report-info p,
.target-content p,
.handle-info p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #374151;
}

.target-content {
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.target-title {
  font-weight: 500;
}

.target-preview {
  color: #6b7280 !important;
  font-size: 13px !important;
}

.target-author {
  color: #9ca3af !important;
  font-size: 12px !important;
}

.handle-info {
  padding: 12px;
  background: #f0fdf4;
  border-radius: 6px;
  margin-top: 12px;
}

.report-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
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

.btn-primary {
  background: #111827;
  color: #f9fafb;
  border-color: #111827;
}

.btn-primary:hover {
  background: #1f2937;
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

.modal-body textarea {
  width: 100%;
  padding: 10px;
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
  
  .report-body {
    grid-template-columns: 1fr;
  }
}
</style>
