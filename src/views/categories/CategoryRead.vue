<template>
  <div class="app-container read-page">
    <div class="read-header">
      <div>
        <h2>{{ category.name || `Категория #${category.id || ''}` }}</h2>
        <p>{{ category.type || '-' }}</p>
      </div>
      <div class="read-actions">
        <router-link :to="{ name: 'editCategory', params: { id: category.id } }" tag="button" class="el-button el-button--primary">
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Categories' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>ID</span><strong>{{ category.id || '-' }}</strong></div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>Название</span><strong>{{ category.name || '-' }}</strong></div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>Тип</span><strong>{{ category.type || '-' }}</strong></div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>Родитель</span><strong>{{ category.categoryId || '-' }}</strong></div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>Фото ID</span><strong>{{ category.photoId || '-' }}</strong></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'CategoryRead',

  data() {
    return {
      category: {},
      isLoading: true,
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.isLoading = true
      try {
        this.category = await this.$apiClient.service('categories').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить категорию')
      }
      this.isLoading = false
    },
  },
}
</script>

<style scoped>
.read-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.read-header h2{margin:0 0 6px;color:#303133;font-size:24px;font-weight:600}.read-header p{margin:0;color:#909399}.read-actions{display:flex;gap:8px}.read-card{margin-bottom:16px;border-radius:6px}.read-field{min-height:72px;padding:12px 0}.read-field span{display:block;margin-bottom:6px;color:#909399;font-size:13px}.read-field strong{color:#303133;font-size:15px;font-weight:500;overflow-wrap:anywhere}@media (max-width:768px){.read-header{align-items:stretch;flex-direction:column}.read-actions{justify-content:stretch}.read-actions .el-button{flex:1}}
</style>
