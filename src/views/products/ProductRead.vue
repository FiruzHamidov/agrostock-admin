<template>
  <div class="app-container product-read">
    <div class="read-header">
      <div>
        <h2>{{ product.name || `Товар #${product.id || ''}` }}</h2>
        <p>{{ getStatusLabel(product.status) }}</p>
      </div>
      <div class="read-actions">
        <router-link
          :to="{ name: 'editProducts', params: { id: product.id } }"
          tag="button"
          class="el-button el-button--primary"
        >
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Products' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>ID</span>
            <strong>{{ product.id || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Тип</span>
            <strong>{{ product.type === 'sell' ? 'Продаю' : 'Покупаю' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Модерация</span>
            <strong>{{ getModerationLabel(product.moderationStatus) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Цена</span>
            <strong>{{ product.unitPrice || '-' }} {{ currencySymbols[product.currency] || product.currency || '' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Объем</span>
            <strong>{{ product.batchSize || '-' }} {{ getBatchUnitLabel(product.batchSizeUnit) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Категория</span>
            <strong>{{ getNestedName(product.category) || product.categoryId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Компания</span>
            <strong>{{ getCompanyLabel(product.company) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Налог</span>
            <strong>{{ getTaxLabel(product.taxType) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Упаковка</span>
            <strong>{{ product.packagingType || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Сорт/качество</span>
            <strong>{{ product.grade || product.quality || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Калибр</span>
            <strong>{{ product.caliber || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Безопасная сделка</span>
            <strong>{{ product.isSafePossible ? 'Да' : 'Нет' }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Локация</h3>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Страна</span>
            <strong>{{ getNestedName(product.country) || product.countryId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Город</span>
            <strong>{{ getNestedName(product.city) || product.cityId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Адрес</span>
            <strong>{{ product.address || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Страна происхождения</span>
            <strong>{{ getNestedName(product.productionCountry) || product.productionCountryId || '-' }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Фотографии</h3>
      <div v-if="product.photos && product.photos.length" class="photos">
        <img v-for="photo in product.photos" :key="photo.id" :src="photo.path" alt="product" />
      </div>
      <p v-else class="description">-</p>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Описание</h3>
      <p class="description">{{ product.description || '-' }}</p>
    </el-card>
  </div>
</template>

<script>
import { batchUnitSizes, taxTypes, currencySymbols } from '@/utils/variables'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'ProductRead',

  data() {
    return {
      product: {},
      isLoading: true,
      currencySymbols,
      statuses: {
        pending: 'Ожидает',
        active: 'Активен',
        closed: 'Закрыт',
        banned: 'Заблокирован',
        rejected: 'Отклонен',
      },
      moderationStatuses: {
        pending: 'Ожидает',
        approved: 'Одобрен',
        rejected: 'Отклонен',
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
        this.product = await this.$apiClient.service('products').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить товар')
      }
      this.isLoading = false
    },

    getStatusLabel(status) {
      return this.statuses[status] || status || '-'
    },

    getModerationLabel(status) {
      return this.moderationStatuses[status] || status || '-'
    },

    getNestedName(entity) {
      return entity && (entity.name || entity.organizationName || entity.fullName)
    },

    getCompanyLabel(company) {
      if (!company) return this.product.companyId || '-'
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

.photos {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photos img {
  width: 140px;
  height: 140px;
  border-radius: 6px;
  object-fit: cover;
  object-position: center;
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
