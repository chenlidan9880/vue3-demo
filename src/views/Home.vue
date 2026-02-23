<template>
  <div class="home">
    <h1>欢迎来到房屋预订系统</h1>
    <div class="nav-links">
      <router-link to="/login" class="btn btn-primary">登录</router-link>
      <router-link to="/register" class="btn btn-secondary">注册</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 上下左右居中显示 */
  justify-content: center;
  height: 90vh;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.nav-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #35a372;
}

.btn-secondary {
  background-color: #35495e;
  color: white;
}

.btn-secondary:hover {
  background-color: #2c3e50;
}
</style>

