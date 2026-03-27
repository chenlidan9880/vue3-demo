<template>
  <div class="notification-center">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">‹</span>
      </button>
      <h1 class="title">消息中心</h1>
      <button class="read-all-btn" @click="markAllAsRead" v-if="unreadCount > 0">
        全部已读
      </button>
    </header>

    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
        <span class="badge" v-if="tab.count > 0">{{ tab.count > 99 ? '99+' : tab.count }}</span>
      </button>
    </div>

    <main class="content">
      <div class="loading" v-if="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div class="empty-state" v-else-if="notifications.length === 0">
        <div class="empty-icon">📭</div>
        <p class="empty-title">暂无消息</p>
        <p class="empty-subtitle">{{ getEmptyText() }}</p>
      </div>

      <div class="notification-list" v-else>
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', { unread: notification.status === 0 }]"
          @click="viewNotification(notification)"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <span class="notification-title">{{ notification.title }}</span>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <p class="notification-text">{{ notification.content }}</p>
            <div class="notification-footer" v-if="notification.relatedType">
              <span class="related-tag" @click.stop="goToRelated(notification)">
                查看详情 ›
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

export default {
  name: 'NotificationCenter',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const activeTab = ref('all')
    const notifications = ref([])
    const unreadCounts = reactive({
      total: 0,
      system: 0,
      order: 0,
      refund: 0,
      complaint: 0,
      chat: 0
    })

    const tabs = computed(() => [
      { key: 'all', label: '全部', count: unreadCounts.total },
      { key: 'system', label: '系统通知', count: unreadCounts.system },
      { key: 'order', label: '订单通知', count: unreadCounts.order },
      { key: 'refund', label: '退款通知', count: unreadCounts.refund },
      { key: 'complaint', label: '投诉通知', count: unreadCounts.complaint }
    ])

    const unreadCount = computed(() => unreadCounts.total)

    const loadNotifications = async () => {
      loading.value = true
      try {
        const type = activeTab.value === 'all' ? '' : activeTab.value
        const res = await request.get('/api/notifications', {
          params: { type }
        })
        if (res.data && res.data.code === 200) {
          notifications.value = res.data.data || []
        }
      } catch (e) {
        console.error('加载通知失败:', e)
      } finally {
        loading.value = false
      }
    }

    const loadUnreadCounts = async () => {
      try {
        const res = await request.get('/api/notifications/unread-count')
        if (res.data && res.data.code === 200) {
          const counts = res.data.data
          unreadCounts.total = counts.total || 0
          unreadCounts.system = counts.system || 0
          unreadCounts.order = counts.order || 0
          unreadCounts.refund = counts.refund || 0
          unreadCounts.complaint = counts.complaint || 0
          unreadCounts.chat = counts.chat || 0
        }
      } catch (e) {
        console.error('加载未读数量失败:', e)
      }
    }

    const switchTab = (key) => {
      activeTab.value = key
      loadNotifications()
    }

    const viewNotification = async (notification) => {
      if (notification.status === 0) {
        try {
          await request.put(`/api/notifications/${notification.id}/read`)
          notification.status = 1
          loadUnreadCounts()
        } catch (e) {
          console.error('标记已读失败:', e)
        }
      }
      goToRelated(notification)
    }

    const goToRelated = (notification) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const userType = userInfo.userType
      
      if (notification.relatedType === 'booking') {
        // 点击查看详情，先进入预约详情页面
        if (userType === 2) {
          router.push(`/host/bookings/${notification.relatedId}`)
        } else if (userType === 3) {
          router.push('/admin/refunds/review')
        } else {
          router.push(`/bookings/${notification.relatedId}`)
        }
      } else if (notification.relatedType === 'complaint') {
        if (userType === 3) {
          router.push('/admin/complaints/review')
        } else {
          router.push('/my-complaints')
        }
      } else if (notification.relatedType === 'property') {
        if (userType === 3) {
          router.push('/admin/properties/review')
        } else {
          router.push(`/properties/${notification.relatedId}`)
        }
      } else if (notification.relatedType === 'refund') {
        if (userType === 3) {
          router.push('/admin/refunds/review')
        } else {
          router.push('/bookings')
        }
      } else if (notification.relatedType === 'question') {
        if (userType === 3) {
          router.push('/admin/community/audit')
        } else {
          router.push('/community')
        }
      } else if (notification.relatedType === 'report') {
        if (userType === 3) {
          router.push('/admin/reports')
        } else {
          router.push('/community')
        }
      }
    }

    const markAllAsRead = async () => {
      try {
        await request.put('/api/notifications/read-all')
        notifications.value.forEach(n => n.status = 1)
        loadUnreadCounts()
      } catch (e) {
        console.error('全部标记已读失败:', e)
      }
    }

    const getNotificationIcon = (type) => {
      const icons = {
        system: '🔔',
        order: '📦',
        refund: '💰',
        complaint: '⚠️',
        chat: '💬'
      }
      return icons[type] || '📢'
    }

    const getEmptyText = () => {
      const texts = {
        all: '暂无任何消息',
        system: '暂无系统通知',
        order: '暂无订单通知',
        refund: '暂无退款通知',
        complaint: '暂无投诉通知'
      }
      return texts[activeTab.value] || '暂无消息'
    }

    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      
      if (diff < 60 * 1000) {
        return '刚刚'
      }
      if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / 60000) + '分钟前'
      }
      if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / 3600000) + '小时前'
      }
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / 86400000) + '天前'
      }
      return date.toLocaleDateString('zh-CN')
    }

    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      loadNotifications()
      loadUnreadCounts()
    })

    return {
      loading,
      activeTab,
      notifications,
      unreadCounts,
      tabs,
      unreadCount,
      switchTab,
      viewNotification,
      markAllAsRead,
      getNotificationIcon,
      getEmptyText,
      formatTime,
      goBack,
      goToRelated
    }
  }
}
</script>

<style scoped>
.notification-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.back-icon {
  font-size: 28px;
  color: #333;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.read-all-btn {
  background: none;
  border: none;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
}

.read-all-btn:hover {
  background: #e6f7ff;
}

.tabs {
  display: flex;
  background: #ffffff;
  padding: 0 16px;
  border-bottom: 1px solid #e5e5e5;
  overflow-x: auto;
}

.tab {
  flex: 1;
  min-width: 80px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
  white-space: nowrap;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  border-radius: 9px;
  padding: 0 6px;
  margin-left: 4px;
  line-height: 18px;
}

.content {
  flex: 1;
  overflow-y: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.notification-list {
  background: #ffffff;
}

.notification-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.unread {
  background: #e6f7ff;
}

.notification-item.unread:hover {
  background: #d6f0ff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notification-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-text {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-footer {
  margin-top: 4px;
}

.related-tag {
  font-size: 13px;
  color: #1890ff;
  cursor: pointer;
}

.related-tag:hover {
  color: #40a9ff;
}
</style>
