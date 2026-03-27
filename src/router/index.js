import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import MessageList from '@/views/MessageList.vue'
import NotificationCenter from '@/views/NotificationCenter.vue'
import ChatPage from '@/views/ChatPage.vue'
import PropertyList from '@/views/PropertyList.vue'
import PropertyDetail from '@/views/Propertydetail.vue'
import BookingForm from '@/views/BookingForm.vue'
import BookingList from '@/views/BookingList.vue'
import BookingDetail from '@/views/BookingDetail.vue'
import RefundForm from '@/views/RefundForm.vue'
import HostDashboard from '@/views/HostDashboard.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import HostPropertyList from '@/views/HostPropertyList.vue'
import HostPropertyForm from '@/views/HostPropertyForm.vue'
import AdminPropertyReview from '@/views/AdminPropertyReview.vue'
import AdminRefundReview from '@/views/AdminRefundReview.vue'
import ReviewForm from '@/views/ReviewForm.vue'
import ComplaintForm from '@/views/ComplaintForm.vue'
import ReviewList from '@/views/ReviewList.vue'
import MyComplaints from '@/views/MyComplaints.vue'
import AdminComplaintReview from '@/views/AdminComplaintReview.vue'
import AdminComplaintHistory from '@/views/AdminComplaintHistory.vue'
import CommunityPage from '@/views/CommunityPage.vue'
import QuestionDetail from '@/views/QuestionDetail.vue'
import AskQuestion from '@/views/AskQuestion.vue'
import AdminQuestionAudit from '@/views/AdminQuestionAudit.vue'
import CategoryManage from '@/views/CategoryManage.vue'
import ReportAudit from '@/views/ReportAudit.vue'
import DataManage from '@/views/DataManage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/messages',
    name: 'MessageListPage',
    component: MessageList,
    meta: { requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/notifications',
    name: 'NotificationCenterPage',
    component: NotificationCenter,
    meta: { requiresAuth: true, roles: [1, 2, 3] }
  },
  {
    path: '/chat/:userId',
    name: 'ChatPage',
    component: ChatPage,
    meta: { requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/properties',
    name: 'PropertyListPage',
    component: PropertyList
  },
  {
    path: '/properties/:id',
    name: 'PropertyDetailPage',
    component: PropertyDetail
  },
  {
    path: '/properties/:id/book',
    name: 'BookingFormPage',
    component: BookingForm,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/host/bookings',
    name: 'HostBookingListPage',
    component: () => import('../views/HostBookingList.vue'),
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/host/bookings/:id',
    name: 'HostBookingDetailPage',
    component: () => import('../views/HostBookingDetail.vue'),
    meta: { requiresAuth: true, roles: [2] }
  },
  {
    path: '/bookings',
    name: 'BookingListPage',
    component: BookingList,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/bookings/:id',
    name: 'BookingDetailPage',
    component: BookingDetail,
    meta: { requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/bookings/:id/refund',
    name: 'RefundFormPage',
    component: RefundForm,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/my-complaints',
    name: 'MyComplaintsPage',
    component: MyComplaints,
    meta: { requiresAuth: true, roles: [1] }
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
  },
  {
    path: '/admin/properties/review',
    name: 'AdminPropertyReviewPage',
    component: AdminPropertyReview,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/admin/refunds/review',
    name: 'AdminRefundReviewPage',
    component: AdminRefundReview,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/admin/complaints/review',
    name: 'AdminComplaintReviewPage',
    component: AdminComplaintReview,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/admin/complaints/history',
    name: 'AdminComplaintHistoryPage',
    component: AdminComplaintHistory,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/bookings/:id/review',
    name: 'ReviewFormPage',
    component: ReviewForm,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/bookings/:id/complaint',
    name: 'ComplaintFormPage',
    component: ComplaintForm,
    meta: { requiresAuth: true, roles: [1] }
  },
  {
    path: '/properties/:id/reviews',
    name: 'ReviewListPage',
    component: ReviewList
  },
  {
    path: '/community',
    name: 'CommunityPage',
    component: CommunityPage
  },
  {
    path: '/community/questions/:id',
    name: 'QuestionDetailPage',
    component: QuestionDetail
  },
  {
    path: '/community/ask',
    name: 'AskQuestionPage',
    component: AskQuestion,
    meta: { requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/admin/community/audit',
    name: 'AdminQuestionAuditPage',
    component: AdminQuestionAudit,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/admin/community/categories',
    name: 'CategoryManagePage',
    component: CategoryManage,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/admin/reports',
    name: 'ReportAuditPage',
    component: ReportAudit,
    meta: { requiresAuth: true, roles: [3] }
  },
  {
    path: '/admin/data/:tab?',
    name: 'DataManagePage',
    component: DataManage,
    meta: { requiresAuth: true, roles: [3] }
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

