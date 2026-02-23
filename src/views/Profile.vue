<template>
  <div class="profile-page">
    <!-- 顶部导航栏 -->
    <header class="profile-header">
      <div class="header-content">
        <h1>个人中心</h1>
        <button class="btn btn-back" @click="goBack">返回</button>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="profile-main">
      <div class="profile-container">
        <!-- 用户头像和基本信息 -->
        <section class="profile-section">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img 
                v-if="userInfo.avatar" 
                :src="userInfo.avatar" 
                alt="头像" 
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
              </div>
            </div>
            <h2>{{ userInfo.username || '用户' }}</h2>
            <p class="role-text">{{ roleText }}</p>
          </div>
        </section>

        <!-- 个人信息表单 -->
        <section class="profile-section">
          <h3>个人信息</h3>
          <form @submit.prevent="handleSubmit" class="profile-form">
            <div class="form-group">
              <label>用户名</label>
              <input 
                type="text" 
                :value="userInfo.username" 
                disabled 
                class="form-control disabled"
              />
              <small class="form-text">用户名注册后不可修改</small>
            </div>

            <div class="form-group">
              <label>真实姓名</label>
              <input 
                type="text" 
                v-model="formData.realName" 
                placeholder="请输入真实姓名"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>邮箱</label>
              <input 
                type="email" 
                v-model="formData.email" 
                placeholder="请输入邮箱"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>手机号</label>
              <input 
                type="tel" 
                v-model="formData.phone" 
                placeholder="请输入手机号"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>性别</label>
              <select v-model="formData.gender" class="form-control">
                <option :value="null">请选择</option>
                <option :value="0">未知</option>
                <option :value="1">男</option>
                <option :value="2">女</option>
              </select>
            </div>

            <div class="form-group">
              <label>生日</label>
              <input 
                type="date" 
                v-model="formData.birthday" 
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>头像URL</label>
              <input 
                type="url" 
                v-model="formData.avatar" 
                placeholder="请输入头像图片URL"
                class="form-control"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? '保存中...' : '保存修改' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="resetForm">
                重置
              </button>
            </div>
          </form>
        </section>

        <!-- 账户信息（只读） -->
        <section class="profile-section">
          <h3>账户信息</h3>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">用户ID：</span>
              <span class="info-value">{{ userInfo.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用户类型：</span>
              <span class="info-value">{{ roleText }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">账户状态：</span>
              <span class="info-value">{{ userInfo.status === 1 ? '正常' : '禁用' }}</span>
            </div>
            <div class="info-item" v-if="userInfo.createdAt">
              <span class="info-label">注册时间：</span>
              <span class="info-value">{{ userInfo.createdAt }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { getUserProfileApi, updateUserProfileApi } from '@/api/user'

export default {
  name: 'ProfilePage',
  data() {
    return {
      userInfo: {},
      formData: {
        realName: '',
        email: '',
        phone: '',
        gender: null,
        birthday: '',
        avatar: ''
      },
      originalFormData: {},
      loading: false
    }
  },
  computed: {
    roleText() {
      const type = this.userInfo.userType
      if (type === 1) return '租客'
      if (type === 2) return '房东'
      if (type === 3) return '管理员'
      return '普通用户'
    }
  },
  mounted() {
    this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      try {
        const response = await getUserProfileApi()
        if (response.code === 200) {
          this.userInfo = response.data
          // 填充表单数据
          this.formData = {
            realName: this.userInfo.realName || '',
            email: this.userInfo.email || '',
            phone: this.userInfo.phone || '',
            gender: this.userInfo.gender !== null ? this.userInfo.gender : null,
            birthday: this.userInfo.birthday || '',
            avatar: this.userInfo.avatar || ''
          }
          // 保存原始数据用于重置
          this.originalFormData = { ...this.formData }
        } else {
          this.$message?.error?.(response.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        alert('获取用户信息失败，请检查网络连接')
      }
    },
    async handleSubmit() {
      this.loading = true
      try {
        const response = await updateUserProfileApi(this.formData)
        if (response.code === 200) {
          alert('保存成功！')
          // 更新本地存储的用户信息
          const updatedUserInfo = {
            ...this.userInfo,
            ...response.data
          }
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
          // 重新加载用户信息
          await this.loadUserProfile()
        } else {
          alert(response.message || '保存失败')
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        alert('更新用户信息失败，请检查网络连接')
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.formData = { ...this.originalFormData }
    },
    goBack() {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.profile-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.profile-main {
  padding: 24px 40px 40px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.profile-section h3 {
  margin: 0 0 20px;
  font-size: 18px;
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 8px;
}

.avatar-section {
  text-align: center;
  padding: 20px 0;
}

.avatar-wrapper {
  margin: 0 auto 16px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #42b983;
  font-weight: bold;
}

.avatar-section h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #2c3e50;
}

.role-text {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.profile-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #42b983;
}

.form-control.disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b983;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #35a372;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #555;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-back {
  background: transparent;
  color: #42b983;
  border: 1px solid #42b983;
}

.btn-back:hover {
  background: #42b983;
  color: #fff;
}

.info-list {
  margin-top: 20px;
}

.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #555;
  min-width: 100px;
}

.info-value {
  color: #2c3e50;
}
</style>















