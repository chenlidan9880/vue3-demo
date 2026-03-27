<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <!-- 验证方式选择 -->
        <div class="form-row">
          <label class="section-label">验证方式：</label>
          <div class="verify-type-selector">
            <label class="radio-option" :class="{ active: verifyType === 'phone' }">
              <input type="radio" v-model="verifyType" value="phone" name="verifyType" />
              <span>📱 手机号</span>
            </label>
            <label class="radio-option" :class="{ active: verifyType === 'email' }">
              <input type="radio" v-model="verifyType" value="email" name="verifyType" />
              <span>📧 邮箱</span>
            </label>
          </div>
        </div>

        <!-- 手机号/邮箱输入 -->
        <div class="form-row">
          <label class="section-label">{{ verifyType === 'phone' ? '手机号：' : '邮箱：' }}</label>
          <input
            v-if="verifyType === 'phone'"
            v-model="formData.phone"
            type="tel"
            placeholder="请输入手机号"
            maxlength="11"
            required
          />
          <input
            v-else
            v-model="formData.email"
            type="email"
            placeholder="请输入QQ邮箱"
            required
          />
        </div>

        <!-- 验证码 -->
        <div class="form-row">
          <label class="section-label">验证码：</label>
          <div class="code-input-group">
            <input
              v-model="formData.verificationCode"
              type="text"
              placeholder="请输入验证码"
              maxlength="6"
              required
            />
            <button
              type="button"
              class="btn-send-code"
              :disabled="codeSending || countdown > 0"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <!-- 密码 -->
        <div class="form-row">
          <label class="section-label">密码：</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
          />
        </div>

        <!-- 确认密码 -->
        <div class="form-row">
          <label class="section-label">确认密码：</label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <!-- 注册角色 -->
        <div class="form-row">
          <label class="section-label">注册角色：</label>
          <div class="role-selection">
            <label class="role-option" :class="{ active: formData.userType === 1 }">
              <input type="radio" v-model="formData.userType" :value="1" name="userType" />
              <span class="role-icon">👤</span>
              <span class="role-name">租客</span>
            </label>
            <label class="role-option" :class="{ active: formData.userType === 2 }">
              <input type="radio" v-model="formData.userType" :value="2" name="userType" />
              <span class="role-icon">🏠</span>
              <span class="role-name">房东</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-register" :disabled="loading">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
          <router-link to="/login" class="btn btn-link">已有账号？去登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { registerApi, sendVerificationCodeApi, sendEmailVerificationCodeApi } from '@/api/auth'

export default {
  name: 'RegisterPage',
  data() {
    return {
      verifyType: 'phone',
      formData: {
        phone: '',
        email: '',
        verificationCode: '',
        password: '',
        confirmPassword: '',
        userType: 1
      },
      loading: false,
      codeSending: false,
      countdown: 0,
      countdownTimer: null
    }
  },
  beforeUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  methods: {
    isValidPhone(phone) {
      return /^1[3-9]\d{9}$/.test(phone)
    },

    isValidEmail(email) {
      return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    },

    async sendVerificationCode() {
      if (this.verifyType === 'phone') {
        if (!this.formData.phone) {
          alert('请输入手机号')
          return
        }
        if (!this.isValidPhone(this.formData.phone)) {
          alert('手机号格式不正确')
          return
        }
        this.codeSending = true
        try {
          const res = await sendVerificationCodeApi({ phone: this.formData.phone })
          if (res.data && res.data.code === 200) {
            alert('验证码已发送，请查看手机短信（开发测试：查看后端控制台）')
            this.startCountdown()
          } else {
            alert(res.data?.message || '发送失败')
          }
        } catch (e) {
          alert('错误：' + (e?.response?.data?.message || '发送请求失败'))
        } finally {
          this.codeSending = false
        }
      } else {
        if (!this.formData.email) {
          alert('请输入邮箱')
          return
        }
        if (!this.isValidEmail(this.formData.email)) {
          alert('邮箱格式不正确')
          return
        }
        this.codeSending = true
        try {
          const res = await sendEmailVerificationCodeApi({ email: this.formData.email })
          if (res.data && res.data.code === 200) {
            alert('验证码已发送，请查收邮件')
            this.startCountdown()
          } else {
            alert(res.data?.message || '发送失败')
          }
        } catch (e) {
          alert('错误：' + (e?.response?.data?.message || '发送请求失败'))
        } finally {
          this.codeSending = false
        }
      }
    },

    startCountdown() {
      this.countdown = 60
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
        }
      }, 1000)
    },

    async handleRegister() {
      if (!this.formData.verificationCode) {
        alert('请输入验证码')
        return
      }
      if (!this.formData.password) {
        alert('请输入密码')
        return
      }
      if (this.formData.password.length < 6) {
        alert('密码至少 6 位')
        return
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        alert('两次输入的密码不一致！')
        return
      }

      this.loading = true
      try {
        const payload = {
          password: this.formData.password,
          verificationCode: this.formData.verificationCode,
          userType: this.formData.userType
        }
        if (this.verifyType === 'phone') {
          payload.phone = this.formData.phone
        } else {
          payload.email = this.formData.email
        }

        const res = await registerApi(payload)
        if (res.data && res.data.code === 200) {
          alert('注册成功，请登录')
          this.$router.push('/login')
        } else {
          alert(res.data?.message || '注册失败')
        }
      } catch (e) {
        alert('错误：' + (e?.response?.data?.message || '注册请求失败'))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 10px;
  background-image: url('@/assets/beijing.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 0;
}

.register-box {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px 48px;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin: 0 0 28px 0;
  font-size: 28px;
  font-weight: 600;
}

.form-row {
  margin-bottom: 18px;
}

.section-label {
  display: block;
  font-size: 15px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  height: 44px;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 验证方式选择 */
.verify-type-selector {
  display: flex;
  gap: 8px;
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  font-size: 16px;
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

/* 验证码输入组 */
.code-input-group {
  display: flex;
  gap: 8px;
}

.code-input-group input {
  flex: 1;
}

.btn-send-code {
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  min-width: 120px;
  height: 44px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-send-code:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-send-code:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* 角色选择 */
.role-selection {
  display: flex;
  gap: 8px;
}

.role-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  gap: 10px;
}

.role-option input[type="radio"] {
  display: none;
}

.role-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.role-icon {
  font-size: 26px;
}

.role-name {
  font-size: 17px;
  font-weight: 500;
  color: #333;
}

/* 按钮 */
.form-actions {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
}

.btn-register {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.btn-register:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-register:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-link {
  background-color: transparent;
  color: #3b82f6;
  font-size: 15px;
}

.btn-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-box {
    padding: 20px;
  }
  
  .code-input-group {
    flex-direction: column;
  }
  
  .btn-send-code {
    width: 100%;
  }
}
</style>
