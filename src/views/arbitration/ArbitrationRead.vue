<template>
  <div class="app-container arbitration-read">
    <div class="read-header">
      <div>
        <h2>Арбитраж #{{ deal.id || '' }}</h2>
        <p>{{ getStatusLabel(deal.status) }} | {{ getStageLabel(deal.stageStatus) }}</p>
      </div>
      <div class="read-actions">
        <router-link
          :to="{ name: 'editArbitrations', params: { id: deal.id } }"
          tag="button"
          class="el-button el-button--primary"
        >
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Arbitrations' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>ID сделки</span>
            <strong>{{ deal.id || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Сумма сделки</span>
            <strong>{{ deal.price || '-' }} {{ currencySymbols[deal.currency] || deal.currency || '' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Объем</span>
            <strong>{{ deal.batchSize || '-' }} {{ getBatchUnitLabel(deal.batchSizeUnit) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Тип сделки</span>
            <strong>{{ deal.isSafe ? 'Безопасная' : 'Не безопасная' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Статус</span>
            <strong>{{ getStatusLabel(deal.status) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Этап</span>
            <strong>{{ getStageLabel(deal.stageStatus) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Покупатель</span>
            <strong>{{ getCompanyLabel(deal.buyer || deal.buyerCompany, deal.buyerId) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Продавец</span>
            <strong>{{ getCompanyLabel(deal.seller || deal.sellerCompany, deal.sellerId) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Дата создания</span>
            <strong>{{ deal.createdAt | dateTime }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Доставка</h3>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Страна</span>
            <strong>{{ getNestedName(deal.country) || deal.countryId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Город</span>
            <strong>{{ getNestedName(deal.city) || deal.cityId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Адрес</span>
            <strong>{{ deal.address || '-' }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Информация</h3>
      <p class="description">{{ deal.info || deal.description || '-' }}</p>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import { batchUnitSizes, currencySymbols } from '@/utils/variables'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'ArbitrationRead',

  filters: {
    dateTime(value) {
      return moment(value).isValid() ? moment(value).format('YYYY-MM-DD HH:mm') : '-'
    },
  },

  data() {
    return {
      deal: {},
      isLoading: true,
      currencySymbols,
      statuses: {
        active: 'Активен',
        cancelled: 'Отменен',
        done: 'Завершен',
        arbitration: 'Арбитраж',
      },
      stageStatuses: {
        reserveFunds: 'Резервирование',
        sendProduct: 'Отправка товара',
        done: 'Закрытие сделки',
      },
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.isLoading = true
      try {
        this.deal = await this.$apiClient.service('deals').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить арбитраж')
      }
      this.isLoading = false
    },

    getStatusLabel(status) {
      return this.statuses[status] || status || '-'
    },

    getStageLabel(status) {
      return this.stageStatuses[status] || status || '-'
    },

    getNestedName(entity) {
      return entity && (entity.name || entity.organizationName || entity.fullName)
    },

    getCompanyLabel(company, fallbackId) {
      if (!company) return fallbackId || '-'
      return company.organizationName || company.fullName || company.username || company.email || `Компания #${company.id}`
    },

    getBatchUnitLabel(value) {
      const unit = batchUnitSizes.find(item => item.value === value)
      return unit ? unit.label : value || ''
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
