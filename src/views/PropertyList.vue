<template>
  <div class="property-list-page">
    <!-- 顶部搜索条 -->
    <header class="filter-bar">
      <div class="filter-left">
        <h1 class="title">精选民宿房源</h1>
        <p class="subtitle">根据城市、价格和房型，快速找到适合你的下榻之所</p>
      </div>
      <div class="filter-right">
        <input
          v-model="filters.keyword"
          class="input"
          type="text"
          placeholder="搜索城市 / 标题关键字"
          @keyup.enter="fetchList"
        />
        <select v-model="filters.roomType" class="select" @change="fetchList">
          <option value="">房型不限</option>
          <option value="1">一居室</option>
          <option value="2">二居室</option>
          <option value="3">三居室</option>
          <option value="4">四居室及以上</option>
        </select>
        <button class="btn btn-primary" @click="fetchList">搜索</button>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="content">
      <div v-if="loading" class="state tips">正在加载房源，请稍候...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="list.length === 0" class="state empty">暂时没有找到符合条件的房源</div>
      <div v-else class="grid">
        <article
          v-for="item in filteredList"
          :key="item.id"
          class="card"
          @click="goDetail(item.id)"
        >
          <div class="card-cover">
            <!-- 目前没有图片字段，先用渐变背景占位 -->
            <div class="cover-placeholder">
              <span class="cover-title">{{ item.city || '热门城市' }}</span>
            </div>
            <span class="price-tag">￥{{ item.pricePerNight }} / 晚</span>
          </div>
          <div class="card-body">
            <h2 class="card-title" :title="item.title">{{ item.title }}</h2>
            <p class="card-location">
              {{ item.city || '未知城市' }} · {{ item.district || '未知区域' }}
            </p>
            <p class="card-desc">
              {{ item.description || '房东很忙，还没来得及填写详细描述。' }}
            </p>
            <div class="card-footer">
              <span class="tag">
                👥 可住 {{ item.maxGuests || 1 }} 人
              </span>
              <span class="tag" v-if="item.rating">
                ⭐ {{ item.rating }} 分
              </span>
              <span class="tag status-tag" :data-status="item.status">
                {{ statusText(item.status) }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'PropertyListPage',
  data() {
    return {
      list: [],
      loading: false,
      error: null,
      filters: {
        keyword: '',
        roomType: ''
      }
    }
  },
  computed: {
    // 前端简单过滤（后续可以改成带参数请求后端）
    filteredList() {
      let result = this.list
      if (this.filters.keyword) {
        const kw = this.filters.keyword.toLowerCase()
        result = result.filter((item) => {
          return (
            (item.title && item.title.toLowerCase().includes(kw)) ||
            (item.city && item.city.toLowerCase().includes(kw))
          )
        })
      }
      if (this.filters.roomType) {
        const rt = Number(this.filters.roomType)
        result = result.filter((item) => Number(item.roomType) === rt)
      }
      return result
    }
  },
  async created() {
    await this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        const res = await request.get('/api/properties')
        if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
          this.list = res.data.data
        } else {
          this.error = res.data?.message || '加载房源列表失败'
        }
      } catch (e) {
        this.error = e?.response?.data?.message || '加载房源列表失败'
      } finally {
        this.loading = false
      }
    },
    goDetail(id) {
      // 详情页下一步实现，这里先预留路由结构
      this.$router.push(`/properties/${id}`)
    },
    statusText(status) {
      if (status === 1) return '可预订'
      if (status === 2) return '维护中'
      if (status === 3) return '已下架'
      return '未知状态'
    }
  }
}
</script>

<style scoped>
.property-list-page {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-left .title {
  margin: 0;
  font-size: 22px;
  color: #1f2933;
}

.filter-left .subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input {
  width: 220px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.15);
}

.select {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
}

.content {
  padding: 24px 40px 40px;
}

.state {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}

.state.tips {
  color: #6b7280;
}

.state.error {
  color: #b91c1c;
}

.state.empty {
  color: #9ca3af;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.card-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.cover-placeholder {
  height: 100%;
  background: linear-gradient(135deg, #42b983, #2c3e50);
  display: flex;
  align-items: flex-end;
  padding: 12px;
}

.cover-title {
  font-size: 14px;
  color: #f9fafb;
  font-weight: 500;
}

.price-tag {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  font-size: 13px;
  color: #111827;
}

.card-body {
  padding: 14px 14px 12px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-location {
  margin: 6px 0 4px;
  font-size: 13px;
  color: #6b7280;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
  height: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
}

.status-tag[data-status='1'] {
  background: #ecfdf3;
  color: #15803d;
}

.status-tag[data-status='2'] {
  background: #fef3c7;
  color: #92400e;
}

.status-tag[data-status='3'] {
  background: #fee2e2;
  color: #b91c1c;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #42b983;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #35a372;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filter-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .input {
    flex: 1;
    min-width: 160px;
  }
}
</style>





