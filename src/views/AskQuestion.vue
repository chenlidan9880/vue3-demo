<template>
  <div class="ask-question">
    <header class="header">
      <button class="btn btn-outline" @click="goBack">返回社区</button>
      <h1 class="title">提问</h1>
    </header>

    <main class="content">
      <form class="question-form" @submit.prevent="submitQuestion">
        <div class="form-row">
          <label for="category">问题分类 *</label>
          <select id="category" v-model="form.categoryId" required>
            <option value="">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <label for="title">问题标题 *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            maxlength="120"
            placeholder="请简要描述你的问题（不超过120字）"
            required
          />
          <span class="char-count">{{ form.title.length }}/120</span>
        </div>

        <div class="form-row">
          <label for="content">问题内容 *</label>
          <textarea
            id="content"
            v-model="form.content"
            rows="8"
            placeholder="请详细描述你的问题，包括具体情况、相关背景等，以便其他用户更好地帮助你"
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="goBack">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid || submitting">
            {{ submitting ? '提交中...' : '提交问题' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script>
import request from '@/api/request'

export default {
  name: 'AskQuestionPage',
  data() {
    return {
      categories: [],
      form: {
        categoryId: '',
        title: '',
        content: ''
      },
      submitting: false
    }
  },
  computed: {
    isFormValid() {
      return this.form.categoryId && 
             this.form.title.trim() && 
             this.form.content.trim()
    }
  },
  async created() {
    await this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await request.get('/api/community/categories')
        if (res.data && res.data.code === 200) {
          this.categories = res.data.data || []
        }
      } catch (e) {
        console.error('获取分类失败', e)
        alert('获取分类失败')
      }
    },
    async submitQuestion() {
      if (!this.isFormValid) return

      this.submitting = true
      try {
        const res = await request.post('/api/community/questions', {
          categoryId: this.form.categoryId,
          title: this.form.title.trim(),
          content: this.form.content.trim()
        })
        if (res.data && res.data.code === 200) {
          const result = res.data.data
          const hasSensitiveWords = result && result.rejectReason
          if (hasSensitiveWords) {
            alert('问题提交成功，内容包含敏感词需管理员审核后发布')
          } else {
            alert('问题发布成功！')
          }
          this.$router.push('/community')
        } else {
          alert(res.data?.message || '提交失败')
        }
      } catch (e) {
        alert(e?.response?.data?.message || '提交失败')
      } finally {
        this.submitting = false
      }
    },
    goBack() {
      this.$router.push('/community')
    }
  }
}
</script>

<style scoped>
.ask-question {
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
  max-width: 800px;
  margin: 0 auto;
}

.question-form {
  background: #ffffff;
  border-radius: 10px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.form-row {
  margin-bottom: 24px;
  position: relative;
}

.form-row label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-row input,
.form-row select,
.form-row textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-row textarea {
  resize: vertical;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
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

@media (max-width: 768px) {
  .header {
    padding: 16px 24px;
  }
  
  .content {
    padding: 16px 24px;
  }
  
  .question-form {
    padding: 20px;
  }
}
</style>
