<template>
  <div class="app-container transaction-read">
    <div class="read-header">
      <div>
        <h2>Транзакция #{{ transaction.id || '' }}</h2>
        <p>{{ getTypeLabel(transaction.type) }} | {{ getStatusLabel(transaction.status) }}</p>
      </div>
      <div class="read-actions">
        <router-link
          :to="{ name: 'editTransaction', params: { id: transaction.id } }"
          tag="button"
          class="el-button el-button--primary"
        >
          Изменить
        </router-link>
        <el-button @click="$router.push({ name: 'Transactions' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>ID</span>
            <strong>{{ transaction.id || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Сумма</span>
            <strong>{{ transaction.sum || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Тип</span>
            <strong>{{ getTypeLabel(transaction.type) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Тип транзакции</span>
            <strong>{{ getTransactionTypeLabel(transaction.transactionType) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Статус</span>
            <strong>{{ getStatusLabel(transaction.status) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Дата операции</span>
            <strong>{{ transaction.date | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Дата создания</span>
            <strong>{{ transaction.createdAt | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Начало</span>
            <strong>{{ transaction.dateStart | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Окончание</span>
            <strong>{{ transaction.dateEnd | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Связанная сущность</span>
            <strong>{{ transaction.entityId || transaction.dealId || transaction.tenderId || '-' }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'TransactionRead',

  filters: {
    dateTime(value) {
      return moment(value).isValid() ? moment(value).format('YYYY-MM-DD HH:mm') : '-'
    },
  },

  data() {
    return {
      transaction: {},
      isLoading: true,
      types: {
        tender: 'Тендер',
        'tender-commission': 'Тендерная комиссия',
        deal: 'Сделка',
        user: 'Пользователь',
      },
      statuses: {
        wait: 'В ожидание',
        active: 'Активен',
        cancelled: 'Отменен',
        done: 'Завершен',
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
        this.transaction = await this.$apiClient.service('transactions').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить транзакцию')
      }
      this.isLoading = false
    },

    getTypeLabel(type) {
      return this.types[type] || type || '-'
    },

    getStatusLabel(status) {
      return this.statuses[status] || status || '-'
    },

    getTransactionTypeLabel(type) {
      return type === 'replenishment' ? 'Пополнение' : type === 'write-off' ? 'Списание' : type || '-'
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
.read-field { min-height: 72px; padding: 12px 0; }
.read-field span { display: block; margin-bottom: 6px; color: #909399; font-size: 13px; }
.read-field strong { color: #303133; font-size: 15px; font-weight: 500; overflow-wrap: anywhere; }

@media (max-width: 768px) {
  .read-header { align-items: stretch; flex-direction: column; }
  .read-actions { justify-content: stretch; }
  .read-actions .el-button { flex: 1; }
}
</style>
