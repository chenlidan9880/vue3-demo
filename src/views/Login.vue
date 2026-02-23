<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
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
      <div class="back-home">
        <router-link to="/">返回首页</router-link>
      </div>
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

        alert('登录成功')
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
  min-height: 80vh;
  padding: 20px;
}

.login-box {
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
  /* border-color: #42b983; */
  border-color: #FFEFB0;
  border-color: #000000;

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

.btn-login {
  background-color: #42b983;
  color: white;
  margin-bottom: 10px;
}

.btn-login:hover {
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
</style>

