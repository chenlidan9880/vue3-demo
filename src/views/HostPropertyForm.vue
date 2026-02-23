<template>
  <div class="host-property-form">
    <header class="header">
      <div>
        <h1>{{ isEdit ? '编辑房源' : '发布新房源' }}</h1>
        <p class="subtitle">
          {{ isEdit ? '修改房源的基础信息和价格' : '填写房源信息并发布到平台' }}
        </p>
      </div>
      <button class="btn btn-outline" @click="goBack">返回我的房源</button>
    </header>

    <main class="main">
      <form class="form" @submit.prevent="handleSubmit">
        <div class="form-row">
          <label>房源标题 *</label>
          <input v-model="form.title" type="text" required placeholder="例如：珠海近海景观温馨两居室" />
        </div>

        <div class="form-row">
          <label>房源描述</label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="简单介绍一下房源亮点、周边环境和入住须知"
          ></textarea>
        </div>

        <div class="form-row grid-3">
          <div>
            <label>房源类型 *</label>
            <select v-model.number="form.propertyType" required>
              <option :value="1">整租</option>
              <option :value="2">合租</option>
              <option :value="3">单间</option>
            </select>
          </div>
          <div>
            <label>户型 *</label>
            <select v-model.number="form.roomType" required>
              <option :value="1">一居室</option>
              <option :value="2">二居室</option>
              <option :value="3">三居室</option>
              <option :value="4">四居室及以上</option>
            </select>
          </div>
          <div>
            <label>建筑面积 (㎡)</label>
            <input v-model.number="form.area" type="number" min="0" />
          </div>
        </div>

        <div class="form-row grid-3">
          <div>
            <label>最多可住人数</label>
            <input v-model.number="form.maxGuests" type="number" min="1" />
          </div>
          <div>
            <label>每晚价格 *</label>
            <input v-model.number="form.pricePerNight" type="number" min="0" required />
          </div>
          <div>
            <label>清洁费</label>
            <input v-model.number="form.cleaningFee" type="number" min="0" />
          </div>
        </div>

        <div class="form-row grid-3">
          <div>
            <label>押金</label>
            <input v-model.number="form.securityDeposit" type="number" min="0" />
          </div>
          <div>
            <label>入住时间</label>
            <input v-model="form.checkInTime" type="time" />
          </div>
          <div>
            <label>退房时间</label>
            <input v-model="form.checkOutTime" type="time" />
          </div>
        </div>

        <div class="form-row">
          <label>详细地址 *</label>
          <input v-model="form.address" type="text" required />
        </div>

        <div class="form-row grid-2">
          <div>
            <label>城市 *</label>
            <input v-model="form.city" type="text" required />
          </div>
          <div>
            <label>区/县</label>
            <input v-model="form.district" type="text" />
          </div>
        </div>

        <div class="form-row">
          <label>房源图片（可上传多张）</label>
          <input type="file" multiple accept="image/*" @change="onFilesChange" />
          <p style="margin-top: 4px; font-size: 12px; color: #6b7280">
            选择多张图片后，在提交发布时会自动上传到阿里云 OSS 并关联到房源。
          </p>
          <div v-if="uploadedImageUrls.length" style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px">
            <img
              v-for="url in uploadedImageUrls"
              :key="url"
              :src="url"
              alt="房源图片预览"
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="goBack">取消</button>
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? '保存修改' : '提交发布' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script>
import {
  createPropertyApi,
  updatePropertyApi,
  getMyPropertiesApi,
  uploadPropertyImagesApi
} from '@/api/hostProperty'

export default {
  name: 'HostPropertyFormPage',
  data() {
    return {
      form: {
        title: '',
        description: '',
        propertyType: 1,
        roomType: 1,
        area: null,
        maxGuests: 1,
        pricePerNight: 0,
        cleaningFee: 0,
        securityDeposit: 0,
        address: '',
        city: '',
        district: '',
        checkInTime: '',
        checkOutTime: ''
      },
      // 选择的本地图片文件
      files: [],
      // 上传成功后返回的图片 URL（用于简单预览）
      uploadedImageUrls: [],
      loading: false
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id
    }
  },
  async created() {
    if (this.isEdit) {
      await this.loadForEdit()
    }
  },
  methods: {
    async loadForEdit() {
      this.loading = true
      try {
        // 简化处理：从“我的房源列表”中查找对应房源
        const res = await getMyPropertiesApi()
        const list = (res.data && res.data.data) || []
        const target = list.find((item) => String(item.id) === String(this.$route.params.id))
        if (!target) {
          alert('未找到要编辑的房源')
          this.goBack()
          return
        }
        this.form = {
          title: target.title,
          description: target.description,
          propertyType: target.propertyType,
          roomType: target.roomType,
          area: target.area,
          maxGuests: target.maxGuests,
          pricePerNight: target.pricePerNight,
          cleaningFee: target.cleaningFee,
          securityDeposit: target.securityDeposit,
          address: target.address,
          city: target.city,
          district: target.district,
          checkInTime: target.checkInTime || '',
          checkOutTime: target.checkOutTime || ''
        }
      } catch (e) {
        alert(e?.response?.data?.message || '加载房源信息失败')
      } finally {
        this.loading = false
      }
    },
    onFilesChange(e) {
      const files = e.target.files
      this.files = files ? Array.from(files) : []
    },
    async handleSubmit() {
      if (!this.form.title || !this.form.pricePerNight) {
        alert('请至少填写标题和每晚价格')
        return
      }
      const payload = {
        ...this.form
      }
      try {
        this.loading = true
        let imageUrls = []
        // 新增房源时，如选择了本地图片，则先上传图片到 OSS，拿到图片 URL 再一起提交
        if (!this.isEdit && this.files.length > 0) {
          const formData = new FormData()
          this.files.forEach((file) => {
            formData.append('files', file)
          })
          const res = await uploadPropertyImagesApi(formData)
          imageUrls = (res.data && res.data.data) || []
          this.uploadedImageUrls = imageUrls
        }
        if (!this.isEdit && imageUrls.length > 0) {
          payload.imageUrls = imageUrls
        }
        if (this.isEdit) {
          await updatePropertyApi(this.$route.params.id, payload)
        } else {
          await createPropertyApi(payload)
        }
        alert('保存成功')
        this.goBack()
      } catch (e) {
        alert(e?.response?.data?.message || '保存失败')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push('/host/properties')
    }
  }
}
</script>

<style scoped>
.host-property-form {
  min-height: 100vh;
  background: #f7f8fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header h1 {
  margin: 0;
  font-size: 22px;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.main {
  padding: 24px 40px 40px;
}

.form {
  max-width: 760px;
  margin: 0 auto;
  background: #ffffff;
  padding: 20px 22px 24px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.form-row {
  margin-bottom: 14px;
}

.form-row label {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  color: #374151;
}

.form-row input,
.form-row textarea,
.form-row select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  box-sizing: border-box;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #42b983;
  color: #ffffff;
}

.btn-primary:hover {
  background: #35a372;
}

.btn-outline {
  border: 1px solid #42b983;
  color: #42b983;
  background: transparent;
}

.btn-outline:hover {
  background: #42b983;
  color: #ffffff;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form {
    padding: 16px;
  }

  .grid-3,
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>





