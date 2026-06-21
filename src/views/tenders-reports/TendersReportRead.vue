<template>
  <div class="app-container report-read">
    <div class="read-header">
      <div>
        <h2>Жалоба на торги #{{ report.id || '' }}</h2>
        <p>{{ getTypeLabel(report.type) }} | {{ report.createdAt | dateTime }}</p>
      </div>
      <div class="read-actions">
        <router-link
          :to="{ name: 'editTendersReport', params: { id: report.id } }"
          tag="button"
          class="el-button el-button--primary"
        >
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'TendersReports' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>ID жалобы</span>
            <strong>{{ report.id || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Тип</span>
            <strong>{{ getTypeLabel(report.type) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Общее кол-во жалоб</span>
            <strong>{{ report.reportsCount || 0 }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Торги</span>
            <strong>{{ getTenderLabel(report.tender, report.tenderId) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Отправитель</span>
            <strong>{{ getCompanyLabel(report.company, report.companyId) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Дата</span>
            <strong>{{ report.createdAt | dateTime }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Описание</h3>
      <p class="description">{{ report.text || '-' }}</p>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'TendersReportRead',

  filters: {
    dateTime(value) {
      return moment(value).isValid() ? moment(value).format('YYYY-MM-DD HH:mm') : '-'
    },
  },

  data() {
    return {
      report: {},
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
        this.report = await this.$apiClient.service('tenders-reports').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить жалобу')
      }
      this.isLoading = false
    },

    getTypeLabel(type) {
      return type === 'common' ? 'Общий' : type === 'spam' ? 'Спам' : type || '-'
    },

    getTenderLabel(tender, fallbackId) {
      if (!tender) return fallbackId || '-'
      return `${tender.name || 'Торги'} #${tender.id || fallbackId || ''}`
    },

    getCompanyLabel(company, fallbackId) {
      if (!company) return fallbackId || '-'
      return company.organizationName || company.fullName || company.username || company.email || `Компания #${company.id}`
    },
  },
}
</script>

<style scoped>
.read-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.read-header h2 { margin: 0 0 6px; color: #303133; font-size: 24px; font-weight: 600; }
.read-header p { margin: 0; color: #909399; }
.read-actions { display: flex; gap: 8px; }
.read-card { margin-bottom: 16px; border-radius: 6px; }
.read-card h3 { margin: 0 0 16px; color: #303133; font-size: 18px; }
.read-field { min-height: 72px; padding: 12px 0; }
.read-field span { display: block; margin-bottom: 6px; color: #909399; font-size: 13px; }
.read-field strong { color: #303133; font-size: 15px; font-weight: 500; overflow-wrap: anywhere; }
.description { margin: 0; color: #606266; line-height: 1.7; white-space: pre-wrap; }

@media (max-width: 768px) {
  .read-header { align-items: stretch; flex-direction: column; }
  .read-actions { justify-content: stretch; }
  .read-actions .el-button { flex: 1; }
}
</style>
