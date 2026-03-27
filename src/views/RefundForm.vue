<template>
  <div class="refund-form">
    <header class="header">
      <button class="btn btn-outline" @click="goBack">返回详情</button>
      <h1 class="title">申请退款</h1>
    </header>

    <main class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!booking" class="error">预约信息加载失败</div>
      
      <div v-else class="form-container">
        <!-- 预约信息 -->
        <div class="booking-info">
          <h2 class="section-title">预约信息</h2>
          <div class="info-item">
            <span class="label">房源：</span>
            <span>{{ booking.propertyTitle }}</span>
          </div>
          <div class="info-item">
            <span class="label">入住日期：</span>
            <span>{{ formatDate(booking.checkIn) }}</span>
          </div>
          <div class="info-item">
            <span class="label">退房日期：</span>
            <span>{{ formatDate(booking.checkOut) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实付金额：</span>
            <span class="amount">￥{{ booking.paidAmount }}</span>
          </div>
        </div>

        <!-- 退款表单 -->
        <form class="form" @submit.prevent="handleSubmit">
          <div class="form-row">
            <label for="refundReasonType">退款原因类型 *</label>
            <select 
              id="refundReasonType" 
              v-model="form.refundReasonType" 
              required 
              @change="handleReasonTypeChange"
            >
              <option value="">请选择退款原因类型</option>
              <option value="1">用户原因</option>
              <option value="2">房东原因</option>
              <option value="3">平台原因</option>
              <option value="4">不可抗力</option>
            </select>
          </div>

          <div class="form-row">
            <label for="refundReason">退款原因 *</label>
            <textarea 
              id="refundReason" 
              v-model="form.refundReason" 
              rows="4" 
              required 
              placeholder="请详细说明退款原因"
            ></textarea>
          </div>

          <div class="form-row" v-if="form.refundReasonType == 4">
            <label for="proofMaterialUrl">证明材料（不可抗力需要）</label>
            <input 
              id="proofMaterialUrl" 
              v-model="form.proofMaterialUrl" 
              type="text" 
              placeholder="请上传证明材料URL"
            />
            <span class="hint">如自然灾害、疫情管控等，需提供官方证明</span>
          </div>

          <!-- 退款金额计算 -->
          <div class="refund-calculation">
            <h3>退款金额计算</h3>
            <div class="calc-item">
              <span>实付金额</span>
              <span>￥{{ booking.paidAmount }}</span>
            </div>
            <div class="calc-item" v-if="penaltyAmount > 0">
              <span>违约金</span>
              <span class="penalty">-￥{{ penaltyAmount }}</span>
            </div>
            <div class="calc-item total">
              <span>预计退款金额</span>
              <span class="refund-amount">￥{{ estimatedRefundAmount }}</span>
            </div>
            <div class="refund-tip" v-if="refundTip">
              {{ refundTip }}
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="goBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || submitting">
              {{ submitting ? '提交中...' : '提交申请' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'RefundFormPage',
  data() {
    return {
      booking: null,
      loading: false,
      error: null,
      submitting: false,
      form: {
        refundReasonType: '',
        refundReason: '',
        proofMaterialUrl: '',
        isForceMajeure: false
      },
      penaltyAmount: 0,
      refundTip: ''
    }
  },
  computed: {
    bookingId() {
      return this.$route.params.id
    },
    estimatedRefundAmount() {
      if (!this.booking) return 0
      return (this.booking.paidAmount - this.penaltyAmount).toFixed(2)
    },
    isFormValid() {
      return this.form.refundReasonType && 
             this.form.refundReason && 
             (this.form.refundReasonType != 4 || this.form.proofMaterialUrl)
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
          this.calculateRefundAmount()
        } else {
          this.error = res.data?.message || '获取预约详情失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '获取预约详情失败'
      } finally {
        this.loading = false
      }
    },
    handleReasonTypeChange() {
      this.form.isForceMajeure = this.form.refundReasonType == 4
      this.calculateRefundAmount()
    },
    calculateRefundAmount() {
      if (!this.booking) return

      const paidAmount = this.booking.paidAmount
      const checkInDate = new Date(this.booking.checkIn)
      const now = new Date()
      
      // 计算距离入住日期的天数
      const diffTime = checkInDate - now
      const daysUntilCheckIn = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      const reasonType = parseInt(this.form.refundReasonType)

      if (this.form.isForceMajeure) {
        // 不可抗力：全额退款
        this.penaltyAmount = 0
        this.refundTip = '不可抗力情况可全额退款，无违约金'
      } else if (reasonType === 2) {
        // 房东原因：全额退款
        this.penaltyAmount = 0
        this.refundTip = '房东原因可全额退款，平台额外补偿10%违约金'
      } else if (reasonType === 3) {
        // 平台原因：全额退款
        this.penaltyAmount = 0
        this.refundTip = '平台原因可全额退款，平台承担替代性住宿差价'
      } else {
        // 用户原因：根据时间计算违约金
        if (daysUntilCheckIn >= 7) {
          this.penaltyAmount = 0
          this.refundTip = '入住日前≥7天申请退款，无违约金'
        } else if (daysUntilCheckIn >= 3) {
          this.penaltyAmount = paidAmount * 0.20
          this.refundTip = '入住日前3-6天申请退款，扣除20%违约金'
        } else if (daysUntilCheckIn >= 1) {
          this.penaltyAmount = paidAmount * 0.50
          this.refundTip = '入住日前1-2天申请退款，扣除50%违约金'
        } else {
          this.penaltyAmount = paidAmount
          this.refundTip = '入住当日申请退款需提供特殊情况证明'
        }
      }
    },
    async handleSubmit() {
      if (!this.isFormValid) {
        alert('请填写完整的退款信息')
        return
      }

      try {
        this.submitting = true
        const refundData = {
          bookingId: this.bookingId,
          refundAmount: parseFloat(this.estimatedRefundAmount),
          refundReason: this.form.refundReason,
          refundReasonType: parseInt(this.form.refundReasonType),
          proofMaterialUrl: this.form.proofMaterialUrl,
          isForceMajeure: this.form.isForceMajeure
        }

        const res = await request.post('/api/bookings/refund', refundData)
        if (res.data && res.data.code === 200) {
          alert('退款申请已提交，等待管理员审核')
          this.$router.push(`/bookings/${this.bookingId}`)
        } else {
          alert(res.data?.message || '退款申请失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '退款申请失败')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push(`/bookings/${this.bookingId}`)
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
.refund-form {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  gap: 20px;
}

.title {
  margin: 0;
  font-size: 20px;
  color: #1f2933;
  flex: 1;
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

.form-container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.booking-info {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.label {
  font-weight: 500;
  color: #374151;
}

.amount {
  font-weight: 600;
  color: #15803d;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-row select,
.form-row input,
.form-row textarea {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-row select:focus,
.form-row input:focus,
.form-row textarea:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.15);
}

.form-row textarea {
  resize: vertical;
  min-height: 100px;
}

.hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.refund-calculation {
  margin-top: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
}

.refund-calculation h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #111827;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: #4b5563;
}

.calc-item.total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.penalty {
  color: #b91c1c;
}

.refund-amount {
  color: #15803d;
  font-size: 18px;
}

.refund-tip {
  margin-top: 12px;
  padding: 8px 12px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  font-size: 13px;
  color: #1e40af;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
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

.btn-primary:hover:not(:disabled) {
  background: #35a372;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
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
  .header {
    padding: 12px 20px;
  }

  .content {
    padding: 16px 20px;
  }

  .form-container {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
