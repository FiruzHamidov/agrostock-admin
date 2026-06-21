<template>
  <div class="app-container read-page">
    <div class="read-header">
      <div>
        <h2>{{ getTruckName(truck) }}</h2>
        <p>{{ getStatusLabel(truck.status) }} | {{ getModerationLabel(truck.moderationStatus) }}</p>
      </div>
      <div class="read-actions">
        <router-link :to="{ name: 'editTruck', params: { id: truck.id } }" tag="button" class="el-button el-button--primary">
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Trucks' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col v-for="field in fields" :key="field.label" :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>{{ field.label }}</span>
            <strong>{{ field.value }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Комментарий модерации</h3>
      <p class="description">{{ truck.moderationComment || truck.comment || '-' }}</p>
    </el-card>
  </div>
</template>

<script>
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'TruckRead',

  data() {
    return {
      truck: {},
      isLoading: true,
    }
  },

  computed: {
    fields() {
      return [
        { label: 'ID', value: this.truck.id || '-' },
        { label: 'Номер/гос. знак', value: this.truck.number || '-' },
        { label: 'Владелец', value: this.getCompanyLabel(this.truck.company) },
        { label: 'Марка', value: this.truck.brand || '-' },
        { label: 'Модель', value: this.truck.model || '-' },
        { label: 'Год', value: this.truck.year || '-' },
        { label: 'Тип кузова', value: this.truck.bodyType || this.truck.body_type || '-' },
        { label: 'Грузоподъемность', value: this.truck.capacity || '-' },
        { label: 'Объем', value: this.truck.volume || '-' },
        { label: 'Страна', value: this.getNestedName(this.truck.country) || this.truck.countryId || '-' },
        { label: 'Город', value: this.getNestedName(this.truck.city) || this.truck.cityId || '-' },
        { label: 'Адрес', value: this.truck.address || '-' },
      ]
    },
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.isLoading = true
      try {
        const res = await this.$apiClient.service('trucks').get(this.$route.params.id)
        this.truck = res.truck || res.data || res
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить грузовик')
      }
      this.isLoading = false
    },

    getTruckName(truck) {
      return truck.name || truck.title || truck.model || truck.number || `Грузовик #${truck.id || ''}`
    },

    getStatusLabel(status) {
      const statuses = { active: 'Активен', offline: 'Оффлайн', banned: 'Заблокирован' }
      return statuses[status] || status || '-'
    },

    getModerationLabel(status) {
      const statuses = { pending: 'Ожидает', approved: 'Одобрен', rejected: 'Отклонен', banned: 'Заблокирован' }
      return statuses[status] || status || '-'
    },

    getNestedName(entity) {
      return entity && (entity.name || entity.organizationName || entity.fullName)
    },

    getCompanyLabel(company) {
      if (!company) return this.truck.companyId || '-'
      return company.organizationName || company.fullName || company.username || company.email || `Компания #${company.id}`
    },
  },
}
</script>

<style scoped>
.read-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.read-header h2{margin:0 0 6px;color:#303133;font-size:24px;font-weight:600}.read-header p{margin:0;color:#909399}.read-actions{display:flex;gap:8px}.read-card{margin-bottom:16px;border-radius:6px}.read-card h3{margin:0 0 16px;color:#303133;font-size:18px}.read-field{min-height:72px;padding:12px 0}.read-field span{display:block;margin-bottom:6px;color:#909399;font-size:13px}.read-field strong{color:#303133;font-size:15px;font-weight:500;overflow-wrap:anywhere}.description{margin:0;color:#606266;line-height:1.7;white-space:pre-wrap}@media (max-width:768px){.read-header{align-items:stretch;flex-direction:column}.read-actions{justify-content:stretch}.read-actions .el-button{flex:1}}
</style>
