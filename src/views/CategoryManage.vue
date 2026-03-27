<template>
  <div class="category-manage">
    <header class="header">
      <h1 class="title">问题分类管理</h1>
    </header>

    <main class="content">
      <!-- 添加分类 -->
      <div class="add-section">
        <div class="form-row">
          <input
            v-model="newCategory.name"
            type="text"
            placeholder="分类名称"
            maxlength="50"
          />
          <input
            v-model="newCategory.description"
            type="text"
            placeholder="分类描述（可选）"
            maxlength="200"
          />
          <select v-model="newCategory.status">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
          <button class="btn btn-primary" :disabled="!newCategory.name.trim()" @click="addCategory">
            添加分类
          </button>
        </div>
      </div>

      <!-- 分类列表 -->
      <div class="table-section">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>分类名称</th>
              <th>描述</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="loading-cell">加载中...</td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="6" class="empty-cell">暂无分类数据</td>
            </tr>
            <tr v-else v-for="category in categories" :key="category.id">
              <td>{{ category.id }}</td>
              <td>
                <input
                  v-if="editingId === category.id"
                  v-model="editForm.name"
                  type="text"
                  class="edit-input"
                />
                <span v-else>{{ category.name }}</span>
              </td>
              <td>
                <input
                  v-if="editingId === category.id"
                  v-model="editForm.description"
                  type="text"
                  class="edit-input"
                />
                <span v-else>{{ category.description || '-' }}</span>
              </td>
              <td>
                <select
                  v-if="editingId === category.id"
                  v-model="editForm.status"
                  class="edit-select"
                >
                  <option :value="1">启用</option>
                  <option :value="0">禁用</option>
                </select>
                <span v-else :class="['status-tag', category.status === 1 ? 'enabled' : 'disabled']">
                  {{ category.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ formatDateTime(category.createdAt) }}</td>
              <td class="actions">
                <template v-if="editingId === category.id">
                  <button class="btn btn-small btn-success" @click="saveEdit(category)">保存</button>
                  <button class="btn btn-small btn-outline" @click="cancelEdit">取消</button>
                </template>
                <template v-else>
                  <button class="btn btn-small btn-outline" @click="startEdit(category)">编辑</button>
                  <button class="btn btn-small btn-danger" @click="deleteCategory(category)">删除</button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'CategoryManagePage',
  data() {
    return {
      categories: [],
      loading: false,
      newCategory: {
        name: '',
        description: '',
        status: 1
      },
      editingId: null,
      editForm: {
        name: '',
        description: '',
        status: 1
      }
    }
  },
  async created() {
    await this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      this.loading = true
      try {
        const res = await request.get('/api/community/categories/all')
        if (res.data && res.data.code === 200) {
          this.categories = res.data.data || []
        } else {
          alert(res.data?.message || '获取分类失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '获取分类失败')
      } finally {
        this.loading = false
      }
    },
    async addCategory() {
      if (!this.newCategory.name.trim()) return

      try {
        const res = await request.post('/api/community/categories', {
          name: this.newCategory.name.trim(),
          description: this.newCategory.description.trim(),
          status: this.newCategory.status
        })
        if (res.data && res.data.code === 200) {
          alert('添加成功')
          this.newCategory = { name: '', description: '', status: 1 }
          await this.fetchCategories()
        } else {
          alert(res.data?.message || '添加失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '添加失败')
      }
    },
    startEdit(category) {
      this.editingId = category.id
      this.editForm = {
        name: category.name,
        description: category.description || '',
        status: category.status
      }
    },
    cancelEdit() {
      this.editingId = null
      this.editForm = { name: '', description: '', status: 1 }
    },
    async saveEdit(category) {
      if (!this.editForm.name.trim()) {
        alert('分类名称不能为空')
        return
      }

      try {
        const res = await request.put(`/api/community/categories/${category.id}`, {
          name: this.editForm.name.trim(),
          description: this.editForm.description.trim(),
          status: this.editForm.status
        })
        if (res.data && res.data.code === 200) {
          alert('更新成功')
          this.cancelEdit()
          await this.fetchCategories()
        } else {
          alert(res.data?.message || '更新失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '更新失败')
      }
    },
    async deleteCategory(category) {
      if (!confirm(`确定要删除分类"${category.name}"吗？`)) return

      try {
        const res = await request.delete(`/api/community/categories/${category.id}`)
        if (res.data && res.data.code === 200) {
          alert('删除成功')
          await this.fetchCategories()
        } else {
          alert(res.data?.message || '删除失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '删除失败')
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    },
    goBack() {
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.category-manage {
  min-height: 100vh;
  background: #f3f4f6;
}

.header {
  display: flex;
  align-items: center;
  padding: 20px 40px;
  background: #111827;
  color: #f9fafb;
}

.header .btn {
  margin-right: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
}

.content {
  padding: 24px 40px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.add-section {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.form-row input[type="text"] {
  flex: 1;
  min-width: 150px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.form-row select {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
}

.table-section {
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.data-table td {
  font-size: 14px;
  color: #6b7280;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px !important;
  color: #9ca3af;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag.enabled {
  background: #dcfce7;
  color: #16a34a;
}

.status-tag.disabled {
  background: #fee2e2;
  color: #b91c1c;
}

.edit-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  font-size: 14px;
}

.edit-select {
  padding: 6px 10px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-outline {
  background: transparent;
  color: #374151;
}

.btn-outline:hover {
  background: #f3f4f6;
}

.btn-primary {
  background: #111827;
  color: #f9fafb;
  border-color: #111827;
}

.btn-primary:hover {
  background: #1f2937;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: #16a34a;
  color: #ffffff;
  border-color: #16a34a;
}

.btn-success:hover {
  background: #15803d;
}

.btn-danger {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-row input[type="text"],
  .form-row select,
  .form-row .btn {
    width: 100%;
  }
}
</style>
