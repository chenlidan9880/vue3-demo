<template>
  <div class="complaint-form">
    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!booking" class="error">预约信息加载失败</div>
      
      <!-- 已投诉展示 -->
      <div v-else-if="existingComplaint" class="form-container">
        <div class="complaint-display">
          <div class="status-header">
            <span class="status-badge-large complained">✓ 已投诉</span>
          </div>
          
          <div class="booking-info">
            <h2 class="section-title">预约信息</h2>
            <div class="info-item">
              <span class="label">房源：</span>
              <span>{{ booking.propertyTitle }}</span>
            </div>
            <div class="info-item">
              <span class="label">房东：</span>
              <span>{{ booking.ownerUsername }}</span>
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
          
          <div class="complaint-content">
            <h2 class="section-title">投诉详情</h2>
            <div class="info-row">
              <span class="info-label">投诉类型：</span>
              <span class="info-value">{{ getComplaintTypeText(existingComplaint.complaintType) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">投诉状态：</span>
              <span class="status-tag" :class="`status-${existingComplaint.status}`">{{ getStatusText(existingComplaint.status) }}</span>
            </div>
            <div class="info-row content-row">
              <span class="info-label">投诉内容：</span>
              <p class="content-text">{{ existingComplaint.content }}</p>
            </div>
            <div class="info-row" v-if="existingComplaint.proofImages">
              <span class="info-label">凭证图片：</span>
              <div class="proof-images">
                <img v-for="(img, index) in existingComplaint.proofImages.split(',')" :key="index" :src="img.trim()" class="proof-image" @click="previewImage(img.trim())" />
              </div>
            </div>
            <div class="info-row" v-if="existingComplaint.handleResult">
              <span class="info-label">处理结果：</span>
              <p class="content-text">{{ existingComplaint.handleResult }}</p>
            </div>
            <div class="complaint-time">
              <span>投诉时间：{{ formatDate(existingComplaint.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 投诉表单 -->
      <div v-else class="form-container">
        <!-- 预约信息 -->
        <div class="booking-info">
          <h2 class="section-title">预约信息</h2>
          <div class="info-item">
            <span class="label">房源：</span>
            <span>{{ booking.propertyTitle }}</span>
          </div>
          <div class="info-item">
            <span class="label">房东：</span>
            <span>{{ booking.ownerUsername }}</span>
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

        <!-- 投诉表单 -->
        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-row">
            <label for="complaintType">投诉类型 *</label>
            <select 
              id="complaintType" 
              v-model="form.complaintType" 
              required
            >
              <option value="">请选择投诉类型</option>
              <option value="1">房源信息虚假</option>
              <option value="2">设施损坏</option>
              <option value="3">房东服务差</option>
              <option value="4">卫生问题</option>
              <option value="5">其他</option>
            </select>
          </div>

          <div class="form-row">
            <label for="content">投诉内容 *</label>
            <textarea 
              id="content" 
              v-model="form.content" 
              rows="6" 
              required
              placeholder="请详细描述您遇到的问题，包括具体情况、发生时间等，以便管理员更好地处理您的投诉"
            ></textarea>
          </div>

          <div class="form-row">
            <label>凭证图片</label>
            <input type="file" multiple accept="image/*" @change="onImageFilesChange" />
            <span class="hint">建议上传相关照片作为投诉凭证，如房源实际情况照片、设施损坏照片等</span>
            <div v-if="uploadedImages.length" class="image-preview-list">
              <div
                v-for="(url, index) in uploadedImages"
                :key="url"
                class="image-preview-item"
              >
                <img :src="url" alt="凭证图片预览" @click="previewImage(url)" />
                <button type="button" class="remove-btn" @click="removeImage(index)">×</button>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="goBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || submitting || !canSubmitComplaint">
              {{ submitting ? '提交中...' : '提交投诉' }}
            </button>
          </div>
          <div v-if="!canSubmitComplaint" class="submit-warning">
            该订单已有正在处理中的投诉，无法再次提交
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'ComplaintFormPage',
  data() {
    return {
      booking: null,
      loading: false,
      error: null,
      submitting: false,
      existingComplaint: null,
      allComplaints: [],
      uploadedImages: [], // 已上传的图片URL列表
      form: {
        complaintType: '',
        content: '',
        proofImages: ''
      }
    }
  },
  computed: {
    bookingId() {
      return this.$route.params.id
    },
    isFormValid() {
      return this.form.complaintType && this.form.content.trim()
    },
    canSubmitComplaint() {
      // 可以提交投诉的条件：没有投诉记录，或者所有投诉都是已驳回状态
      if (this.allComplaints.length === 0) return true
      // 检查是否所有投诉都是已驳回状态(3)
      return this.allComplaints.every(c => parseInt(c.status) === 3)
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
          // 检查是否已投诉
          await this.checkExistingComplaint()
        } else {
          this.error = res.data?.message || '获取预约详情失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取预约详情失败'
      } finally {
        this.loading = false
      }
    },
    async checkExistingComplaint() {
      try {
        // 查询该订单的所有投诉记录
        const res = await request.get(`/api/complaints/my`)
        console.log('我的投诉列表:', res.data)
        if (res.data && res.data.code === 200 && res.data.data) {
          // 过滤出当前订单的投诉
          const complaints = res.data.data.filter(c => c.bookingId == this.bookingId)
          this.allComplaints = complaints
          console.log('当前订单投诉:', complaints)
          
          // 找到最新的非驳回投诉（待处理或已成立）
          const activeComplaint = complaints.find(c => {
            const status = parseInt(c.status)
            return status === 0 || status === 2
          })
          
          if (activeComplaint) {
            this.existingComplaint = activeComplaint
          }
        }
      } catch (e) {
        // 未投诉或查询失败，不做处理
        console.log('未找到投诉记录:', e)
      }
    },
    getComplaintTypeText(type) {
      const typeMap = {
        1: '房源信息虚假',
        2: '设施损坏',
        3: '房东服务差',
        4: '卫生问题',
        5: '其他'
      }
      return typeMap[type] || '未知类型'
    },
    getStatusText(status) {
      const statusMap = {
        0: '待处理',
        2: '已成立',
        3: '已驳回'
      }
      return statusMap[status] || '未知状态'
    },
    previewImage(url) {
      window.open(url, '_blank')
    },
    onImageFilesChange(e) {
      const files = e.target.files
      if (files && files.length > 0) {
        this.uploadImages(files)
      }
    },
    async uploadImages(files) {
      try {
        this.loading = true
        const formData = new FormData()
        Array.from(files).forEach((file) => {
          formData.append('files', file)
        })
        const res = await request.post('/api/host/upload/images', formData)
        const newUrls = (res.data && res.data.data) || []
        this.uploadedImages = [...this.uploadedImages, ...newUrls]
      } catch (e) {
        alert(e?.response?.data?.message || '图片上传失败')
      } finally {
        this.loading = false
      }
    },
    removeImage(index) {
      this.uploadedImages.splice(index, 1)
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        alert('请填写完整的投诉信息')
        return
      }

      try {
        this.submitting = true
        const complaintData = {
          bookingId: parseInt(this.bookingId),
          complaintType: parseInt(this.form.complaintType),
          content: this.form.content,
          proofImages: this.uploadedImages.join(',')
        }

        const res = await request.post('/api/complaints', complaintData)
        if (res.data && res.data.code === 200) {
          alert('投诉提交成功，管理员将尽快处理')
          this.$router.push(`/bookings/${this.bookingId}`)
        } else {
          alert(res.data?.message || '投诉提交失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '投诉提交失败')
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
.complaint-form {
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

select, input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

select:focus, input:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-item .remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-item .remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
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

.submit-warning {
  text-align: center;
  padding: 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 12px;
}

/* 已投诉展示样式 */
.complaint-display {
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

.status-badge-large.complained {
  background: #fef3c7;
  color: #92400e;
}

.complaint-content {
  background: #f9fafb;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.info-label {
  min-width: 100px;
  font-size: 14px;
  color: #6b7280;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #374151;
}

.content-row {
  flex-direction: column;
}

.content-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  background: #fff;
  padding: 16px;
  border-radius: 6px;
  margin-top: 8px;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.status-tag.status-0 {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.status-2 {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.status-3 {
  background: #fee2e2;
  color: #991b1b;
}

.proof-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.proof-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.proof-image:hover {
  transform: scale(1.05);
}

.complaint-time {
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
}
</style>
