<template>
  <div class="data-manage">
    <header class="header">
      <div class="header-left">
        <h1 class="page-title">数据管理中心</h1>
      </div>
    </header>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: currentTab === tab.key }"
        @click="currentTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.label }}</span>
      </button>
    </div>

    <div v-if="currentTab === 'users'" class="tab-content">
      <div class="toolbar">
        <div class="filter-group">
          <select v-model="userFilter.userType" class="filter-select">
            <option value="">全部用户类型</option>
            <option value="1">租客</option>
            <option value="2">房东</option>
            <option value="3">管理员</option>
          </select>
          <select v-model="userFilter.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="1">正常</option>
            <option value="0">禁用</option>
          </select>
          <button class="btn btn-primary" @click="fetchUsers">筛选</button>
        </div>
        <div class="action-group">
          <button class="btn btn-success" @click="exportUsers('excel')">导出Excel</button>
          <button class="btn btn-success" @click="exportUsers('csv')">导出CSV</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAllUsers" @change="toggleSelectAllUsers"></th>
              <th>ID</th>
              <th>用户名</th>
              <th>手机号</th>
              <th>邮箱</th>
              <th>用户类型</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td><input type="checkbox" v-model="selectedUsers" :value="user.id"></td>
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="tag" :class="getUserTypeClass(user.userType)">
                  {{ getUserTypeText(user.userType) }}
                </span>
              </td>
              <td>
                <span class="tag" :class="user.status === 1 ? 'tag-success' : 'tag-danger'">
                  {{ user.status === 1 ? '正常' : '禁用' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button class="btn btn-sm" :class="user.status === 1 ? 'btn-danger' : 'btn-success'" @click="toggleUserStatus(user)">
                  {{ user.status === 1 ? '禁用' : '启用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="batch-actions" v-if="selectedUsers.length > 0">
        <span>已选择 {{ selectedUsers.length }} 项</span>
        <button class="btn btn-success" @click="batchEnableUsers">批量启用</button>
        <button class="btn btn-danger" @click="batchDisableUsers">批量禁用</button>
      </div>
    </div>

    <div v-if="currentTab === 'properties'" class="tab-content">
      <div class="toolbar">
        <div class="filter-group">
          <select v-model="propertyFilter.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="0">待审核</option>
            <option value="1">已上架</option>
            <option value="2">已下架</option>
          </select>
          <input v-model="propertyFilter.city" type="text" class="filter-input" placeholder="输入城市筛选">
          <button class="btn btn-primary" @click="fetchProperties">筛选</button>
        </div>
        <div class="action-group">
          <button class="btn btn-success" @click="exportProperties('excel')">导出Excel</button>
          <button class="btn btn-success" @click="exportProperties('csv')">导出CSV</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAllProperties" @change="toggleSelectAllProperties"></th>
              <th>ID</th>
              <th>标题</th>
              <th>城市</th>
              <th>价格/晚</th>
              <th>房东ID</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="property in properties" :key="property.id">
              <td><input type="checkbox" v-model="selectedProperties" :value="property.id"></td>
              <td>{{ property.id }}</td>
              <td>{{ property.title }}</td>
              <td>{{ property.city }}</td>
              <td>¥{{ property.pricePerNight }}</td>
              <td>{{ property.ownerId }}</td>
              <td>
                <span class="tag" :class="getPropertyStatusClass(property.status)">
                  {{ getPropertyStatusText(property.status) }}
                </span>
              </td>
              <td>{{ formatDate(property.createdAt) }}</td>
              <td>
                <button class="btn btn-sm btn-primary" @click="viewProperty(property)">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="batch-actions" v-if="selectedProperties.length > 0">
        <span>已选择 {{ selectedProperties.length }} 项</span>
        <button class="btn btn-success" @click="batchEnableProperties">批量上架</button>
        <button class="btn btn-warning" @click="batchDisableProperties">批量下架</button>
      </div>
    </div>

    <div v-if="currentTab === 'bookings'" class="tab-content">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon blue">📊</div>
          <div class="stat-info">
            <div class="stat-value">{{ bookingStats.totalCount }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">💰</div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatAmount(bookingStats.totalAmount) }}</div>
            <div class="stat-label">总交易额</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">📅</div>
          <div class="stat-info">
            <div class="stat-value">{{ bookingStats.todayCount }}</div>
            <div class="stat-label">今日订单</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">⏳</div>
          <div class="stat-info">
            <div class="stat-value">{{ bookingStats.pendingCount }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <h3 class="chart-title">订单趋势（近7天）</h3>
          <div class="chart-container">
            <div class="bar-chart">
              <div v-for="(item, index) in bookingTrend" :key="index" class="bar-item">
                <div class="bar-wrapper">
                  <div class="bar" :style="{ height: getBarHeight(item.count, maxTrendCount) }"></div>
                </div>
                <div class="bar-label">{{ item.date }}</div>
                <div class="bar-value">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">订单状态分布</h3>
          <div class="status-distribution">
            <div v-for="(item, index) in statusDistribution" :key="index" class="status-item">
              <div class="status-info">
                <span class="status-dot" :class="getStatusDotClass(item.status)"></span>
                <span class="status-name">{{ item.statusText }}</span>
              </div>
              <div class="status-bar-wrapper">
                <div class="status-bar" :style="{ width: getStatusWidth(item.count) }"></div>
              </div>
              <span class="status-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="filter-group">
          <select v-model="bookingFilter.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="0">待确认</option>
            <option value="1">待支付</option>
            <option value="2">已支付</option>
            <option value="3">已入住</option>
            <option value="4">已完成</option>
            <option value="5">已取消</option>
          </select>
          <input v-model="bookingFilter.keyword" type="text" class="filter-input" placeholder="搜索房源/租客/订单ID">
          <input v-model="bookingFilter.minAmount" type="number" class="filter-input small" placeholder="最低金额">
          <span class="filter-separator">-</span>
          <input v-model="bookingFilter.maxAmount" type="number" class="filter-input small" placeholder="最高金额">
          <input v-model="bookingFilter.startDate" type="date" class="filter-input">
          <input v-model="bookingFilter.endDate" type="date" class="filter-input">
          <button class="btn btn-primary" @click="fetchBookings">筛选</button>
          <button class="btn btn-default" @click="resetBookingFilter">重置</button>
        </div>
        <div class="action-group">
          <button class="btn btn-success" @click="exportBookings('excel')">导出Excel</button>
          <button class="btn btn-success" @click="exportBookings('csv')">导出CSV</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>订单ID</th>
              <th>房源</th>
              <th>租客</th>
              <th>入住日期</th>
              <th>离店日期</th>
              <th>总金额</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>{{ booking.id }}</td>
              <td>{{ booking.propertyTitle || booking.propertyId }}</td>
              <td>{{ booking.guestUsername || '租客' + booking.guestId }}</td>
              <td>{{ formatDate(booking.checkIn) }}</td>
              <td>{{ formatDate(booking.checkOut) }}</td>
              <td>¥{{ booking.totalAmount }}</td>
              <td>
                <span class="tag" :class="getBookingStatusClass(booking.status)">
                  {{ booking.statusText || getBookingStatusText(booking.status) }}
                </span>
              </td>
              <td>{{ formatDate(booking.createdAt) }}</td>
              <td>
                <button class="btn btn-sm btn-primary" @click="showBookingDetail(booking)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="currentTab === 'reviews'" class="tab-content">
      <div class="toolbar">
        <div class="filter-group">
          <select v-model="reviewFilter.minRating" class="filter-select">
            <option value="">最低评分</option>
            <option value="1">1星</option>
            <option value="2">2星</option>
            <option value="3">3星</option>
            <option value="4">4星</option>
            <option value="5">5星</option>
          </select>
          <select v-model="reviewFilter.maxRating" class="filter-select">
            <option value="">最高评分</option>
            <option value="1">1星</option>
            <option value="2">2星</option>
            <option value="3">3星</option>
            <option value="4">4星</option>
            <option value="5">5星</option>
          </select>
          <button class="btn btn-primary" @click="fetchReviews">筛选</button>
        </div>
      </div>

      <div class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="review-user">
              <span class="user-name">{{ review.guestUsername || '用户' + review.guestId }}</span>
              <div class="rating">
                <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.overallScore }">★</span>
              </div>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
          <div class="review-content">
            <p>{{ review.content }}</p>
          </div>
          <div class="review-footer">
            <span class="property-name">房源: {{ review.propertyTitle || review.propertyId }}</span>
            <button class="btn btn-sm btn-danger" @click="deleteReview(review.id)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentTab === 'export'" class="tab-content">
      <div class="export-section">
        <h3 class="export-title">数据导出中心</h3>
        <p class="export-desc">选择需要导出的数据类型和格式，系统将生成导出文件</p>

        <div class="export-options">
          <div class="export-card">
            <div class="export-icon">👤</div>
            <h4>用户数据</h4>
            <p>导出所有用户信息，包括用户名、联系方式、账号状态等</p>
            <div class="export-actions">
              <button class="btn btn-success" @click="exportUsers('excel')">导出Excel</button>
              <button class="btn btn-success" @click="exportUsers('csv')">导出CSV</button>
            </div>
          </div>

          <div class="export-card">
            <div class="export-icon">🏠</div>
            <h4>房源数据</h4>
            <p>导出所有房源信息，包括标题、地址、价格、状态等</p>
            <div class="export-actions">
              <button class="btn btn-success" @click="exportProperties('excel')">导出Excel</button>
              <button class="btn btn-success" @click="exportProperties('csv')">导出CSV</button>
            </div>
          </div>

          <div class="export-card">
            <div class="export-icon">📅</div>
            <h4>订单数据</h4>
            <p>导出所有订单记录，包括订单状态、金额、时间等</p>
            <div class="export-actions">
              <button class="btn btn-success" @click="exportBookings('excel')">导出Excel</button>
              <button class="btn btn-success" @click="exportBookings('csv')">导出CSV</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="modal-close" @click="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" v-if="bookingDetail">
          <div class="detail-section">
            <h4 class="section-title">订单信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">订单ID</span>
                <span class="detail-value">{{ bookingDetail.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">订单状态</span>
                <span class="tag" :class="getBookingStatusClass(bookingDetail.status)">
                  {{ bookingDetail.statusText }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">入住日期</span>
                <span class="detail-value">{{ formatDate(bookingDetail.checkIn) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">离店日期</span>
                <span class="detail-value">{{ formatDate(bookingDetail.checkOut) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">入住人数</span>
                <span class="detail-value">{{ bookingDetail.guestCount }}人</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">订单金额</span>
                <span class="detail-value amount">¥{{ bookingDetail.totalAmount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">实付金额</span>
                <span class="detail-value">¥{{ bookingDetail.paidAmount || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">创建时间</span>
                <span class="detail-value">{{ formatDate(bookingDetail.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="bookingDetail.property">
            <h4 class="section-title">房源信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">房源标题</span>
                <span class="detail-value">{{ bookingDetail.property.title }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">所在城市</span>
                <span class="detail-value">{{ bookingDetail.property.city }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">详细地址</span>
                <span class="detail-value">{{ bookingDetail.property.address }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">每晚价格</span>
                <span class="detail-value">¥{{ bookingDetail.property.pricePerNight }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="bookingDetail.guest">
            <h4 class="section-title">租客信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">用户名</span>
                <span class="detail-value">{{ bookingDetail.guest.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">手机号</span>
                <span class="detail-value">{{ bookingDetail.guest.phone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">邮箱</span>
                <span class="detail-value">{{ bookingDetail.guest.email }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="bookingDetail.owner">
            <h4 class="section-title">房东信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">用户名</span>
                <span class="detail-value">{{ bookingDetail.owner.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">手机号</span>
                <span class="detail-value">{{ bookingDetail.owner.phone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">邮箱</span>
                <span class="detail-value">{{ bookingDetail.owner.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUsersApi, updateUserStatusApi, batchUpdateUserStatusApi,
  getPropertiesApi, batchUpdatePropertyStatusApi,
  getBookingsApi, getBookingStatisticsApi, getBookingDetailApi,
  getBookingTrendApi, getBookingStatusDistributionApi,
  getReviewsApi, deleteReviewApi,
  exportUsersApi, exportPropertiesApi, exportBookingsApi
} from '@/api/admin'

export default {
  name: 'DataManage',
  data() {
    return {
      currentTab: 'users',
      tabs: [
        { key: 'users', label: '用户管理', icon: '👤' },
        { key: 'properties', label: '房源管理', icon: '🏠' },
        { key: 'bookings', label: '订单管理', icon: '📅' },
        { key: 'reviews', label: '评价管理', icon: '⭐' },
        { key: 'export', label: '数据导出', icon: '📊' }
      ],
      users: [],
      userFilter: { userType: '', status: '' },
      selectedUsers: [],
      selectAllUsers: false,
      properties: [],
      propertyFilter: { status: '', city: '' },
      selectedProperties: [],
      selectAllProperties: false,
      bookings: [],
      bookingFilter: { status: '', keyword: '', minAmount: null, maxAmount: null, startDate: '', endDate: '' },
      bookingStats: { totalCount: 0, totalAmount: 0, todayCount: 0, todayAmount: 0, pendingCount: 0, completedCount: 0 },
      bookingTrend: [],
      statusDistribution: [],
      showDetailModal: false,
      bookingDetail: null,
      reviews: [],
      reviewFilter: { minRating: '', maxRating: '' }
    }
  },
  computed: {
    maxTrendCount() {
      if (!this.bookingTrend.length) return 1
      return Math.max(...this.bookingTrend.map(t => t.count), 1)
    }
  },
  created() {
    const tab = this.$route.query.tab
    if (tab && this.tabs.find(t => t.key === tab)) {
      this.currentTab = tab
    }
    this.fetchUsers()
    this.fetchProperties()
    this.fetchBookings()
    this.fetchBookingStats()
    this.fetchBookingTrend()
    this.fetchStatusDistribution()
    this.fetchReviews()
  },
  methods: {
    goBack() {
      this.$router.push('/admin/dashboard')
    },
    formatDate(date) {
      if (!date) return '-'
      if (typeof date === 'string') return date.split('T')[0]
      return new Date(date).toLocaleDateString('zh-CN')
    },
    formatAmount(amount) {
      if (!amount) return '0'
      return Number(amount).toLocaleString()
    },
    getUserTypeText(type) {
      const types = { 1: '租客', 2: '房东', 3: '管理员' }
      return types[type] || '未知'
    },
    getUserTypeClass(type) {
      const classes = { 1: 'tag-primary', 2: 'tag-success', 3: 'tag-warning' }
      return classes[type] || 'tag-default'
    },
    getPropertyStatusText(status) {
      const statuses = { 0: '待审核', 1: '已上架', 2: '已下架' }
      return statuses[status] || '未知'
    },
    getPropertyStatusClass(status) {
      const classes = { 0: 'tag-warning', 1: 'tag-success', 2: 'tag-default' }
      return classes[status] || 'tag-default'
    },
    getBookingStatusText(status) {
      const statuses = { 0: '待确认', 1: '待支付', 2: '已支付', 3: '已入住', 4: '已完成', 5: '已取消' }
      return statuses[status] || '未知'
    },
    getBookingStatusClass(status) {
      const classes = {
        0: 'tag-warning', 1: 'tag-primary', 2: 'tag-success',
        3: 'tag-info', 4: 'tag-default', 5: 'tag-danger'
      }
      return classes[status] || 'tag-default'
    },
    getBarHeight(count, max) {
      const height = max > 0 ? (count / max) * 100 : 0
      return Math.max(height, 5) + '%'
    },
    getStatusWidth(count) {
      const total = this.statusDistribution.reduce((sum, item) => sum + item.count, 0)
      return total > 0 ? Math.max((count / total) * 100, 5) + '%' : '0%'
    },
    getStatusDotClass(status) {
      const classes = ['warning', 'primary', 'success', 'info', 'default', 'danger']
      return classes[status] || 'default'
    },
    async fetchUsers() {
      try {
        const res = await getUsersApi(this.userFilter)
        if (res.data.code === 200) {
          this.users = res.data.data || []
        }
      } catch (e) {
        console.error('获取用户列表失败:', e)
      }
    },
    toggleSelectAllUsers() {
      this.selectedUsers = this.selectAllUsers ? this.users.map(u => u.id) : []
    },
    async toggleUserStatus(user) {
      try {
        const newStatus = user.status === 1 ? 0 : 1
        await updateUserStatusApi(user.id, newStatus)
        user.status = newStatus
        alert(newStatus === 1 ? '用户已启用' : '用户已禁用')
      } catch (e) {
        alert('操作失败')
      }
    },
    async batchEnableUsers() {
      await this.batchUpdateUserStatus(1)
    },
    async batchDisableUsers() {
      await this.batchUpdateUserStatus(0)
    },
    async batchUpdateUserStatus(status) {
      try {
        await batchUpdateUserStatusApi(this.selectedUsers, status)
        alert('批量更新成功')
        this.selectedUsers = []
        this.selectAllUsers = false
        this.fetchUsers()
      } catch (e) {
        alert('批量更新失败')
      }
    },
    async fetchProperties() {
      try {
        const res = await getPropertiesApi(this.propertyFilter)
        if (res.data.code === 200) {
          this.properties = res.data.data || []
        }
      } catch (e) {
        console.error('获取房源列表失败:', e)
      }
    },
    toggleSelectAllProperties() {
      this.selectedProperties = this.selectAllProperties ? this.properties.map(p => p.id) : []
    },
    viewProperty(property) {
      this.$router.push(`/properties/${property.id}`)
    },
    async batchEnableProperties() {
      await this.batchUpdatePropertyStatus(1)
    },
    async batchDisableProperties() {
      await this.batchUpdatePropertyStatus(2)
    },
    async batchUpdatePropertyStatus(status) {
      try {
        await batchUpdatePropertyStatusApi(this.selectedProperties, status)
        alert('批量更新成功')
        this.selectedProperties = []
        this.selectAllProperties = false
        this.fetchProperties()
      } catch (e) {
        alert('批量更新失败')
      }
    },
    async fetchBookings() {
      try {
        const params = { ...this.bookingFilter }
        if (!params.keyword) delete params.keyword
        if (!params.minAmount) delete params.minAmount
        if (!params.maxAmount) delete params.maxAmount
        if (!params.startDate) delete params.startDate
        if (!params.endDate) delete params.endDate
        if (!params.status) delete params.status
        console.log('发送筛选请求，参数:', params)
        const res = await getBookingsApi(params)
        console.log('筛选响应:', res.data)
        if (res.data.code === 200) {
          this.bookings = res.data.data || []
          console.log('筛选成功，数据条数:', this.bookings.length)
        } else {
          alert('筛选失败: ' + res.data.message)
        }
      } catch (e) {
        console.error('获取订单列表失败:', e)
        alert('筛选失败: ' + (e.response?.data?.message || e.message || '网络错误'))
      }
    },
    async fetchBookingStats() {
      try {
        const res = await getBookingStatisticsApi()
        if (res.data.code === 200) {
          this.bookingStats = res.data.data || {}
        }
      } catch (e) {
        console.error('获取统计数据失败:', e)
      }
    },
    async fetchBookingTrend() {
      try {
        const res = await getBookingTrendApi()
        if (res.data.code === 200) {
          this.bookingTrend = res.data.data || []
        }
      } catch (e) {
        console.error('获取趋势数据失败:', e)
      }
    },
    async fetchStatusDistribution() {
      try {
        const res = await getBookingStatusDistributionApi()
        if (res.data.code === 200) {
          this.statusDistribution = res.data.data || []
        }
      } catch (e) {
        console.error('获取状态分布失败:', e)
      }
    },
    async showBookingDetail(booking) {
      try {
        const res = await getBookingDetailApi(booking.id)
        if (res.data.code === 200) {
          this.bookingDetail = res.data.data
          this.showDetailModal = true
        }
      } catch (e) {
        alert('获取订单详情失败')
      }
    },
    resetBookingFilter() {
      this.bookingFilter = { status: '', keyword: '', minAmount: null, maxAmount: null, startDate: '', endDate: '' }
      this.fetchBookings()
    },
    async fetchReviews() {
      try {
        const res = await getReviewsApi(this.reviewFilter)
        if (res.data.code === 200) {
          this.reviews = res.data.data || []
        }
      } catch (e) {
        console.error('获取评价列表失败:', e)
      }
    },
    async deleteReview(id) {
      if (!confirm('确定要删除这条评价吗？')) return
      try {
        await deleteReviewApi(id)
        alert('评价已删除')
        this.fetchReviews()
      } catch (e) {
        alert('删除失败')
      }
    },
    async exportUsers(format) {
      try {
        const res = await exportUsersApi({ ...this.userFilter, format })
        this.downloadFile(res, `用户数据_${new Date().getTime()}.${format === 'csv' ? 'csv' : 'xlsx'}`)
      } catch (e) {
        alert('导出失败')
      }
    },
    async exportProperties(format) {
      try {
        const res = await exportPropertiesApi({ ...this.propertyFilter, format })
        this.downloadFile(res, `房源数据_${new Date().getTime()}.${format === 'csv' ? 'csv' : 'xlsx'}`)
      } catch (e) {
        alert('导出失败')
      }
    },
    async exportBookings(format) {
      try {
        const res = await exportBookingsApi({ ...this.bookingFilter, format })
        this.downloadFile(res, `订单数据_${new Date().getTime()}.${format === 'csv' ? 'csv' : 'xlsx'}`)
      } catch (e) {
        alert('导出失败')
      }
    },
    downloadFile(response, filename) {
      const blob = new Blob([response.data])
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    }
  }
}
</script>

<style scoped>
.data-manage {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #666;
}

.tab-btn:hover {
  background: #f5f7fa;
}

.tab-btn.active {
  background: #1890ff;
  color: #fff;
}

.tab-icon {
  font-size: 18px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 14px;
}

.filter-input.small {
  width: 100px;
}

.filter-separator {
  color: #999;
}

.action-group {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-success {
  background: #52c41a;
  color: #fff;
}

.btn-success:hover {
  background: #73d13d;
}

.btn-danger {
  background: #ff4d4f;
  color: #fff;
}

.btn-danger:hover {
  background: #ff7875;
}

.btn-warning {
  background: #faad14;
  color: #fff;
}

.btn-warning:hover {
  background: #ffc53d;
}

.btn-default {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e8e8e8;
}

.btn-default:hover {
  background: #e8e8e8;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  color: #1a1a1a;
}

.data-table tr:hover {
  background: #f5f7fa;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-primary {
  background: #e6f7ff;
  color: #1890ff;
}

.tag-success {
  background: #f6ffed;
  color: #52c41a;
}

.tag-warning {
  background: #fffbe6;
  color: #faad14;
}

.tag-danger {
  background: #fff2f0;
  color: #ff4d4f;
}

.tag-info {
  background: #e6fffb;
  color: #13c2c2;
}

.tag-default {
  background: #f5f5f5;
  color: #666;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.blue {
  background: #e6f7ff;
}

.stat-icon.green {
  background: #f6ffed;
}

.stat-icon.orange {
  background: #fffbe6;
}

.stat-icon.purple {
  background: #f9f0ff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.chart-container {
  height: 200px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding-top: 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-wrapper {
  width: 30px;
  height: 140px;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #1890ff, #40a9ff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.bar-label {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.bar-value {
  font-size: 12px;
  color: #1890ff;
  font-weight: 600;
}

.status-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.warning {
  background: #faad14;
}

.status-dot.primary {
  background: #1890ff;
}

.status-dot.success {
  background: #52c41a;
}

.status-dot.info {
  background: #13c2c2;
}

.status-dot.default {
  background: #999;
}

.status-dot.danger {
  background: #ff4d4f;
}

.status-name {
  font-size: 13px;
  color: #666;
}

.status-bar-wrapper {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.status-bar {
  height: 100%;
  background: #1890ff;
  border-radius: 4px;
  transition: width 0.3s;
}

.status-count {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 600;
  color: #1a1a1a;
}

.rating {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 16px;
}

.star.filled {
  color: #faad14;
}

.review-date {
  font-size: 13px;
  color: #999;
}

.review-content {
  margin-bottom: 12px;
  color: #333;
  line-height: 1.6;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.property-name {
  font-size: 13px;
  color: #666;
}

.export-section {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.export-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.export-desc {
  color: #666;
  margin-bottom: 32px;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.export-card {
  padding: 32px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.export-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.1);
}

.export-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.export-card h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.export-card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.export-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-label {
  font-size: 13px;
  color: #999;
}

.detail-value {
  font-size: 14px;
  color: #1a1a1a;
}

.detail-value.amount {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .export-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }

  .filter-group {
    flex-wrap: wrap;
    width: 100%;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>
