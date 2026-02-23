<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名：</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱：</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码：</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码：</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>
        <div class="form-group">
          <label>注册角色：</label>
          <div class="role-selection">
            <label class="role-option">
              <input
                type="radio"
                v-model="formData.userType"
                :value="1"
                name="userType"
              />
              <span class="role-label">
                <span class="role-icon">👤</span>
                <span class="role-text">
                  <strong>租客</strong>
                  <small>预订民宿，享受住宿服务</small>
                </span>
              </span>
            </label>
            <label class="role-option">
              <input
                type="radio"
                v-model="formData.userType"
                :value="2"
                name="userType"
              />
              <span class="role-label">
                <span class="role-icon">🏠</span>
                <span class="role-text">
                  <strong>房东</strong>
                  <small>发布房源，管理订单</small>
                </span>
              </span>
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-register">注册</button>
          <router-link to="/login" class="btn btn-link">已有账号？去登录</router-link>
        </div>
      </form>
      <div class="back-home">
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { registerApi } from '@/api/auth'

export default {
  name: 'RegisterPage',
  data() {
    return {
      formData: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        userType: 1
      },
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      // 基本校验
      if (!this.formData.username || !this.formData.password) {
        alert('用户名和密码必填')
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

      try {
        this.loading = true
        const payload = {
          username: this.formData.username,
          password: this.formData.password,
          email: this.formData.email || undefined,
          phone: this.formData.phone || undefined,
          userType: this.formData.userType
        }

        const res = await registerApi(payload)

        if (!res.data || res.data.code !== 200) {
          alert(res.data?.message || '注册失败')
          return
        }

        alert('注册成功，请登录')
        this.$router.push('/login')
      } catch (e) {
        const msg = e?.response?.data?.message || '注册请求失败，请稍后重试'
        alert(msg)
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
  min-height: 80vh;
  padding: 20px;
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #42b983;
}

.form-actions {
  margin-top: 30px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-register {
  background-color: #42b983;
  color: white;
  margin-bottom: 10px;
}

.btn-register:hover {
  background-color: #35a372;
}

.btn-link {
  background-color: transparent;
  color: #42b983;
  text-decoration: none;
  display: block;
  text-align: center;
  padding: 10px;
}

.btn-link:hover {
  text-decoration: underline;
}

.back-home {
  margin-top: 20px;
  text-align: center;
}

.back-home a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.back-home a:hover {
  color: #42b983;
}

.role-selection {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.role-option {
  flex: 1;
  display: block;
  cursor: pointer;
}

.role-option input[type="radio"] {
  display: none;
}

.role-label {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s;
  background: #fafafa;
}

.role-option input[type="radio"]:checked + .role-label {
  border-color: #42b983;
  background: #f0fdf4;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.role-icon {
  font-size: 32px;
  margin-right: 12px;
  flex-shrink: 0;
}

.role-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-text strong {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.role-text small {
  font-size: 12px;
  color: #888;
}

.role-option:hover .role-label {
  border-color: #42b983;
  background: #f9f9f9;
}
</style>

