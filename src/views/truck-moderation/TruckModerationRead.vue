<template>
  <div class="app-container moderation-read">
    <div class="read-header">
      <div>
        <h2>Модерация грузовика #{{ item.id || '' }}</h2>
        <p>{{ getModerationLabel(item.status) }} | {{ item.createdAt | dateTime }}</p>
      </div>
      <div class="read-actions">
        <router-link
          :to="{ name: 'editTruckModeration', params: { id: item.id } }"
          tag="button"
          class="el-button"
        >
          Изменить
        </router-link>
        <router-link
          v-if="item.truckId"
          :to="{ name: 'readTruck', params: { id: item.truckId } }"
          tag="button"
          class="el-button el-button--primary"
        >
          Грузовик
        </router-link>
        <el-button type="success" @click="moderate('approved')">Одобрить</el-button>
        <el-button type="warning" @click="moderate('rejected')">Отклонить</el-button>
        <el-button type="danger" @click="moderate('banned')">Блок</el-button>
        <el-button type="danger" plain @click="onDelete">Удалить</el-button>
        <el-button @click="$router.push({ name: 'TruckModeration' })">Назад</el-button>
      </div>
    </div>

    <el-card v-loading="isLoading" class="read-card" shadow="never">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>ID</span>
            <strong>{{ item.id || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Грузовик</span>
            <strong>{{ item.truckId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Модератор</span>
            <strong>{{ item.moderatorUserId || '-' }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Статус</span>
            <strong>{{ getModerationLabel(item.status) }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Создано</span>
            <strong>{{ item.createdAt | dateTime }}</strong>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="read-field">
            <span>Обновлено</span>
            <strong>{{ item.updatedAt | dateTime }}</strong>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="read-card" shadow="never">
      <h3>Комментарий</h3>
      <p class="description">{{ item.comment || '-' }}</p>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import confirmUpdate from '@/mixins/confirmUpdate'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'TruckModerationRead',

  filters: {
    dateTime(value) {
      return moment(value).isValid() ? moment(value).format('YYYY-MM-DD HH:mm') : '-'
    },
  },

  mixins: [confirmUpdate],

  data() {
    return {
      item: {},
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
        this.item = await this.$apiClient.service('truck-moderation').get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить запись модерации')
      }
      this.isLoading = false
    },

    getModerationLabel(status) {
      const statuses = {
        pending: 'Ожидает',
        approved: 'Одобрен',
        rejected: 'Отклонен',
        banned: 'Заблокирован',
      }
      return statuses[status] || status || '-'
    },

    async moderate(status) {
      let comment = this.item.comment || ''
      try {
        const result = await this.$prompt('Комментарий модерации', 'Модерация грузовика', {
          confirmButtonText: 'Сохранить',
          cancelButtonText: 'Отмена',
          inputValue: comment,
          inputPattern: status === 'rejected' || status === 'banned' ? /\S+/ : undefined,
          inputErrorMessage: 'Для отклонения или блокировки нужен комментарий',
        })
        comment = result.value
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('truck-moderation').patch(this.$route.params.id, { status, comment })
        this.$message({ message: 'Статус модерации обновлен!', type: 'success' })
        return await this.fetchData()
      } catch (err) {
        handleApiError(this, err, 'Не удалось обновить статус модерации')
        return false
      }
    },

    async onDelete() {
      try {
        await this.confirmUpdate('Точно удалить запись модерации?', 'Запись не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('truck-moderation').remove(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить запись модерации')
        return false
      }

      this.$message({ message: 'Запись модерации удалена!', type: 'success' })
      this.$router.push({ name: 'TruckModeration' })
      return true
    },
  },
}
</script>

<style scoped>
.read-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.read-header h2 { margin: 0 0 6px; color: #303133; font-size: 24px; font-weight: 600; }
.read-header p { margin: 0; color: #909399; }
.read-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.read-card { margin-bottom: 16px; border-radius: 6px; }
.read-card h3 { margin: 0 0 16px; color: #303133; font-size: 18px; }
.read-field { min-height: 72px; padding: 12px 0; }
.read-field span { display: block; margin-bottom: 6px; color: #909399; font-size: 13px; }
.read-field strong { color: #303133; font-size: 15px; font-weight: 500; overflow-wrap: anywhere; }
.description { margin: 0; color: #606266; line-height: 1.7; white-space: pre-wrap; }

@media (max-width: 768px) {
  .read-header { align-items: stretch; flex-direction: column; }
  .read-actions .el-button { flex: 1; }
}
</style>
