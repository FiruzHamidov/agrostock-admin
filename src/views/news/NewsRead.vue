<template>
  <div class="app-container read-page">
    <div class="read-header">
      <div>
        <h2>{{ news.name || `Новость #${news.id || ''}` }}</h2>
        <p>{{ news.language ? `${news.language.name} - ${news.language.code}` : 'Язык не указан' }}</p>
      </div>
      <div class="read-actions">
        <router-link :to="{ name: 'editNews', params: { id: news.id } }" tag="button" class="el-button el-button--primary">
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'News' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>ID</span><strong>{{ news.id || '-' }}</strong></div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>Название</span><strong>{{ news.name || '-' }}</strong></div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field"><span>Язык</span><strong>{{ news.language ? `${news.language.name} - ${news.language.code}` : news.languageId || '-' }}</strong></div>
        </el-col>
      </el-row>
      <img v-if="news.photo && news.photo.path" :src="news.photo.path" class="read-image" alt="news" />
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Текст</h3>
      <div class="description" v-html="news.text || '-'" />
    </el-card>
  </div>
</template>

<script>
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'NewsRead',

  data() {
    return {
      news: {},
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
        this.news = await this.$apiClient.service('news').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить новость')
      }
      this.isLoading = false
    },
  },
}
</script>

<style scoped>
.read-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.read-header h2{margin:0 0 6px;color:#303133;font-size:24px;font-weight:600}.read-header p{margin:0;color:#909399}.read-actions{display:flex;gap:8px}.read-card{margin-bottom:16px;border-radius:6px}.read-card h3{margin:0 0 16px;color:#303133;font-size:18px}.read-field{min-height:72px;padding:12px 0}.read-field span{display:block;margin-bottom:6px;color:#909399;font-size:13px}.read-field strong{color:#303133;font-size:15px;font-weight:500;overflow-wrap:anywhere}.read-image{width:220px;height:140px;border-radius:6px;object-fit:cover;object-position:center}.description{margin:0;color:#606266;line-height:1.7;white-space:pre-wrap}@media (max-width:768px){.read-header{align-items:stretch;flex-direction:column}.read-actions{justify-content:stretch}.read-actions .el-button{flex:1}}
</style>
