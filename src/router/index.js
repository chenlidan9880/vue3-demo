import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import PropertyList from '@/views/PropertyList.vue'
import HostDashboard from '@/views/HostDashboard.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import HostPropertyList from '@/views/HostPropertyList.vue'
import HostPropertyForm from '@/views/HostPropertyForm.vue'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: Home
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: Login
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'DashboardPage',
    component: Dashboard,
    meta: { requiresAuth: true, roles: [1] } // 租客首页
  },
  {
    path: '/profile',
    name: 'ProfilePage',
    component: Profile,
    meta: { requiresAuth: true, roles: [1, 2, 3] }
  },
  {
    path: '/properties',
    name: 'PropertyListPage',
    component: PropertyList
  },
  {
    path: '/host',
    name: 'HostDashboardPage',
    component: HostDashboard,
    meta: { requiresAuth: true, roles: [2] } // 房东首页
  },
  {
    path: '/host/properties',
    name: 'HostPropertyListPage',
    component: HostPropertyList,
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/host/properties/new',
    name: 'HostPropertyCreatePage',
    component: HostPropertyForm,
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/host/properties/:id/edit',
    name: 'HostPropertyEditPage',
    component: HostPropertyForm,
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/admin',
    name: 'AdminDashboardPage',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: [3] } // 管理员首页
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 简单路由守卫：控制登录和按角色访问
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  let userType = null
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
    userType = info.userType
  } catch (e) {
    userType = null
  }

  const requiresAuth = to.meta && to.meta.requiresAuth
  const allowRoles = (to.meta && to.meta.roles) || null

  if (requiresAuth && !token) {
    // 未登录，跳转到登录页
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (allowRoles && userType && !allowRoles.includes(userType)) {
    // 已登录但角色不匹配，根据角色跳转到对应主页
    if (userType === 2) {
      return next('/host')
    }
    if (userType === 3) {
      return next('/admin')
    }
    return next('/dashboard')
  }

  next()
})

export default router

