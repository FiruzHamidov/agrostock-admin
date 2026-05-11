<template>
  <div class="app-container">
    <h2>Модерация сообщений чата</h2>
    <div class="filters">
      <el-select v-model="filters.status" clearable placeholder="Статус">
        <el-option label="Ожидает" value="pending" />
        <el-option label="Одобрено" value="approved" />
        <el-option label="Заблокировано" value="blocked" />
      </el-select>
      <el-select v-model="filters.entityType" clearable placeholder="entityType">
        <el-option label="common-chat-messages" value="common-chat-messages" />
        <el-option label="chats-messages" value="chats-messages" />
      </el-select>
      <el-input v-model.number="filters.companyId" clearable type="number" placeholder="companyId" class="w-140" />
      <el-input v-model.number="filters.userId" clearable type="number" placeholder="userId" class="w-140" />
      <el-button type="primary" @click="onApplyFilters">Применить</el-button>
    </div>
    <el-alert v-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="loadError" :closable="false" :title="loadError" type="error" show-icon />

    <el-table v-loading="loading" :data="items" stripe empty-text="Нет записей">
      <el-table-column prop="id" label="id" width="90" />
      <el-table-column prop="entityType" label="entityType" min-width="180" />
      <el-table-column prop="entityId" label="entityId" width="100" />
      <el-table-column prop="status" label="status" width="120" />
      <el-table-column prop="reason" label="reason" min-width="180" />
      <el-table-column prop="originalText" label="originalText" min-width="180" />
      <el-table-column prop="renderedText" label="renderedText" min-width="180" />
      <el-table-column label="matchedWords" min-width="180">
        <template slot-scope="scope">{{ normalizeWords(scope.row.matchedWords) }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="userId" width="90" />
      <el-table-column prop="companyId" label="companyId" width="110" />
      <el-table-column prop="moderatorUserId" label="moderatorUserId" width="130" />
      <el-table-column prop="createdAt" label="createdAt" min-width="170" />
      <el-table-column label="Action" width="320" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="goToSource(scope.row)">К сообщению</el-button>
          <el-button size="mini" type="success" @click="updateStatus(scope.row, 'approved')">Одобрить</el-button>
          <el-button size="mini" type="warning" @click="updateStatus(scope.row, 'blocked')">Блок</el-button>
          <el-button size="mini" type="danger" @click="removeItem(scope.row)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        :total="total"
        :page-size="pagination.limit"
        :current-page.sync="pagination.page"
        layout="sizes, total, prev, pager, next"
        :page-sizes="[20, 50, 100]"
        background
        @size-change="onSizeChange"
        @current-change="fetchData"
      />
    </div>
  </div>
</template>

<script>
import { chatModerationApi } from '@/api/chat-moderation'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'AdminChatsModerationLog',

  data() {
    return {
      loading: false,
      forbidden: false,
      loadError: '',
      items: [],
      total: 0,
      pagination: { page: 1, limit: 20 },
      filters: {
        status: 'blocked',
        entityType: '',
        companyId: null,
        userId: null,
      },
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    normalizeWords(words) {
      if (Array.isArray(words)) return words.join(', ')
      return words || '-'
    },

    buildQuery() {
      const query = {
        $limit: this.pagination.limit,
        $skip: (this.pagination.page - 1) * this.pagination.limit,
        $sort: { createdAt: -1 },
      }

      Object.keys(this.filters).forEach(key => {
        if (
          this.filters[key] !== '' &&
          this.filters[key] !== null &&
          this.filters[key] !== undefined
        ) {
          query[key] = this.filters[key]
        }
      })

      return query
    },

    async fetchData() {
      this.loading = true
      this.forbidden = false
      this.loadError = ''
      try {
        const res = await chatModerationApi.findModerationLog(this.$apiClient, this.buildQuery())
        this.items = res.data || []
        this.total = res.total || 0
      } catch (error) {
        if (error && Number(error.code) === 403) {
          this.forbidden = true
        }
        const parsed = handleApiError(this, error, 'Не удалось загрузить лог модерации')
        this.loadError = parsed.message
      } finally {
        this.loading = false
      }
    },

    goToSource(row) {
      if (row.entityType === 'chats-messages' && row.chatId) {
        this.$router.push({ name: 'AdminChatsDetails', params: { id: String(row.chatId) } })
        return
      }

      if (row.entityType === 'common-chat-messages') {
        this.$router.push({ name: 'AdminChatsCommon' })
        return
      }

      this.$message({ type: 'warning', message: 'Недостаточно данных для перехода к сообщению' })
    },

    onApplyFilters() {
      this.pagination.page = 1
      this.fetchData()
    },

    onSizeChange(pageSize) {
      this.pagination.limit = pageSize
      this.pagination.page = 1
      this.fetchData()
    },

    async updateStatus(row, status) {
      let reason = row.reason || ''
      try {
        const result = await this.$prompt('Причина модерации', 'Обновление статуса', {
          confirmButtonText: 'Сохранить',
          cancelButtonText: 'Отмена',
          inputValue: reason,
        })
        reason = result.value
      } catch (err) {
        return
      }

      try {
        await chatModerationApi.patchModeration(this.$apiClient, row.id, { status, reason })
        this.$message({ type: 'success', message: 'Статус обновлен' })
        await this.fetchData()
      } catch (error) {
        handleApiError(this, error, 'Не удалось обновить статус модерации')
      }
    },

    async removeItem(row) {
      try {
        await this.$confirm(`Удалить запись #${row.id}?`, 'Подтверждение', {
          type: 'warning',
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
        })
      } catch (err) {
        return
      }

      try {
        await this.$apiClient.service('chat-message-moderation').remove(row.id)
        this.$message({ type: 'success', message: 'Запись удалена' })
        await this.fetchData()
      } catch (error) {
        handleApiError(this, error, 'Не удалось удалить запись модерации')
      }
    },
  },
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  align-items: center;
  flex-wrap: wrap;
}

.w-140 {
  width: 140px;
}

.pager {
  margin-top: 16px;
  text-align: right;
}
</style>
