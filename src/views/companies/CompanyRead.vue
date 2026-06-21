<template>
  <div class="app-container read-page">
    <div class="read-header">
      <div>
        <h2>{{ company.organizationName || company.fullName || `Компания #${company.id || ''}` }}</h2>
        <p>{{ company.email || '-' }}</p>
      </div>
      <div class="read-actions">
        <router-link :to="{ name: 'editCompanies', params: { id: company.id } }" tag="button" class="el-button el-button--primary">
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Companies' })">Назад</el-button>
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
  </div>
</template>

<script>
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'CompanyRead',

  data() {
    return {
      company: {},
      isLoading: true,
    }
  },

  computed: {
    fields() {
      return [
        { label: 'ID', value: this.company.id || '-' },
        { label: 'ФИО', value: this.company.fullName || '-' },
        { label: 'Организация/ИП', value: this.company.organizationName || '-' },
        { label: 'Тип компании', value: this.company.organizationType || '-' },
        { label: 'Email', value: this.company.email || '-' },
        { label: 'Телефон', value: this.company.phone || '-' },
        { label: 'Контактное лицо', value: this.company.contactFullName || '-' },
        { label: 'Контактный телефон', value: this.company.contactPhone || '-' },
        { label: 'Контактная почта', value: this.company.contactEmail || '-' },
        { label: 'Директор', value: this.company.directorFullName || '-' },
        { label: 'ИНН', value: this.company.taxpayerNumber || '-' },
        { label: 'ОГРН', value: this.company.psrn || '-' },
        { label: 'Адрес', value: this.company.address || '-' },
        { label: 'Страна', value: this.getNestedName(this.company.country) || this.company.countryId || '-' },
        { label: 'Рейтинг', value: this.company.rating || '-' },
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
        this.company = await this.$apiClient.service('companies').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить компанию')
      }
      this.isLoading = false
    },

    getNestedName(entity) {
      return entity && (entity.name || entity.organizationName || entity.fullName)
    },
  },
}
</script>

<style scoped>
.read-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.read-header h2{margin:0 0 6px;color:#303133;font-size:24px;font-weight:600}.read-header p{margin:0;color:#909399}.read-actions{display:flex;gap:8px}.read-card{margin-bottom:16px;border-radius:6px}.read-field{min-height:72px;padding:12px 0}.read-field span{display:block;margin-bottom:6px;color:#909399;font-size:13px}.read-field strong{color:#303133;font-size:15px;font-weight:500;overflow-wrap:anywhere}@media (max-width:768px){.read-header{align-items:stretch;flex-direction:column}.read-actions{justify-content:stretch}.read-actions .el-button{flex:1}}
</style>
