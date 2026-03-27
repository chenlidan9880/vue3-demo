<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">账号：</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入手机号或QQ邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码：</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-login">登录</button>
          <router-link to="/register" class="btn btn-link">还没有账号？去注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { loginApi } from '@/api/auth'

export default {
  name: 'LoginPage',
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      if (!this.formData.username || !this.formData.password) {
        alert('请输入用户名和密码')
        return
      }

      try {
        this.loading = true
        const res = await loginApi({
          username: this.formData.username,
          password: this.formData.password
        })

        if (!res.data || res.data.code !== 200) {
          alert(res.data?.message || '登录失败')
          return
        }

        const data = res.data.data
        // 保存 token 和用户信息
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data))

        // 根据用户类型跳转到不同首页：
        // 1-租客 → 普通用户首页；2-房东 → 房东控制台；3-管理员 → 管理员控制台
        const userType = data.userType
        if (userType === 2) {
          this.$router.push('/host')
        } else if (userType === 3) {
          this.$router.push('/admin')
        } else {
          this.$router.push('/dashboard')
        }
      } catch (e) {
        const msg = e?.response?.data?.message || '登录请求失败，请稍后重试'
        alert(msg)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-image: url('@/assets/beijing.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.login-box {
  background: rgba(255, 255, 255, 0.98);
  padding: 48px 56px;
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
  margin: 0 0 36px 0;
  font-size: 28px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 10px;
  color: #555;
  font-weight: 500;
  font-size: 15px;
}

input {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  height: 48px;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  text-decoration: none;
}

.btn-login {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.btn-login:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-link {
  background-color: transparent;
  color: #3b82f6;
  font-size: 15px;
  padding: 10px;
}

.btn-link:hover {
  text-decoration: underline;
}
</style>

