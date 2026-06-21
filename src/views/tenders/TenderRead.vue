<template>
  <div class="app-container tender-read">
    <div class="read-header">
      <div>
        <h2>{{ tender.name || `Торги #${tender.id || ''}` }}</h2>
        <p>{{ getStatusLabel(tender.status) }}</p>
      </div>
      <div class="read-actions">
        <router-link
          :to="{ name: 'editTender', params: { id: tender.id } }"
          tag="button"
          class="el-button el-button--primary"
        >
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Tenders' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>ID</span>
            <strong>{{ tender.id || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Тип</span>
            <strong>{{ tender.type === 'sell' ? 'Продажа' : 'Покупка' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Статус</span>
            <strong>{{ getStatusLabel(tender.status) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Категория</span>
            <strong>{{ getNestedName(tender.category) || tender.categoryId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Компания</span>
            <strong>{{ getCompanyLabel(tender.company) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Начальная цена</span>
            <strong>{{ tender.startPrice || '-' }} {{ currencySymbols[tender.currency] || tender.currency || '' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Объем</span>
            <strong>{{ tender.batchSize || '-' }} {{ getBatchUnitLabel(tender.batchSizeUnit) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Налог</span>
            <strong>{{ getTaxLabel(tender.taxType) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Упаковка</span>
            <strong>{{ tender.packagingType || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Дата начала</span>
            <strong>{{ tender.dateStart | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Дата завершения</span>
            <strong>{{ tender.dateEnd | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Обеспечение участия</span>
            <strong>{{ tender.participationAmount || '-' }}%</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Локация и доставка</h3>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Страна</span>
            <strong>{{ getNestedName(tender.country) || tender.countryId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Город</span>
            <strong>{{ getNestedName(tender.city) || tender.cityId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Адрес</span>
            <strong>{{ tender.address || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Страна происхождения</span>
            <strong>{{ getNestedName(tender.productionCountry) || tender.productionCountryId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Доставка</span>
            <strong>{{ tender.deliveryDescription || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Стоимость доставки</span>
            <strong>{{ tender.isDeliveryIncludesInPrice ? 'Включена в цену' : tender.deliveryPrice || '-' }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Описание</h3>
      <p class="description">{{ tender.description || '-' }}</p>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import { batchUnitSizes, taxTypes, currencySymbols } from '@/utils/variables'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'TenderRead',

  filters: {
    dateTime(value) {
      return moment(value).isValid() ? moment(value).format('YYYY-MM-DD HH:mm') : '-'
    },
  },

  data() {
    return {
      tender: {},
      isLoading: true,
      currencySymbols,
      statuses: {
        wait: 'В ожидании',
        active: 'Активен',
        cancelled: 'Отменен',
        suspended: 'Приостановлен',
        doneWithWinner: 'Завершен (есть победитель)',
        doneWithoutWinner: 'Завершен (нет победителя)',
        banned: 'Заблокирован',
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
        this.tender = await this.$apiClient.service('tenders').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить торги')
      }
      this.isLoading = false
    },

    getStatusLabel(status) {
      return this.statuses[status] || status || '-'
    },

    getNestedName(entity) {
      return entity && (entity.name || entity.organizationName || entity.fullName)
    },

    getCompanyLabel(company) {
      if (!company) return this.tender.companyId || '-'
      return company.organizationName || company.fullName || company.username || company.email || `Компания #${company.id}`
    },

    getBatchUnitLabel(value) {
      const unit = batchUnitSizes.find(item => item.value === value)
      return unit ? unit.label : value || ''
    },

    getTaxLabel(value) {
      const tax = taxTypes.find(item => item.value === value)
      return tax ? tax.label : value || '-'
    },
  },
}
</script>

<style scoped>
.read-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.read-header h2 {
  margin: 0 0 6px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.read-header p {
  margin: 0;
  color: #909399;
}

.read-actions {
  display: flex;
  gap: 8px;
}

.read-card {
  margin-bottom: 16px;
  border-radius: 6px;
}

.read-card h3 {
  margin: 0 0 16px;
  color: #303133;
  font-size: 18px;
}

.read-field {
  min-height: 72px;
  padding: 12px 0;
}

.read-field span {
  display: block;
  margin-bottom: 6px;
  color: #909399;
  font-size: 13px;
}

.read-field strong {
  color: #303133;
  font-size: 15px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.description {
  margin: 0;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .read-header {
    align-items: stretch;
    flex-direction: column;
  }

  .read-actions {
    justify-content: stretch;
  }

  .read-actions .el-button {
    flex: 1;
  }
}
</style>
