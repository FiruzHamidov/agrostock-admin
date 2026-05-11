<template>
  <div class="app-container">
    <h2>Лог модерации</h2>
    <el-alert v-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="loadError" :closable="false" :title="loadError" type="error" show-icon />

    <el-table v-loading="loading" :data="items" stripe empty-text="Нет записей">
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
      <el-table-column label="Action" width="170" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="goToSource(scope.row)">К сообщению</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        :total="total"
        :page-size="pagination.limit"
        :current-page.sync="pagination.page"
        layout="total, prev, pager, next"
        background
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
      pagination: { page: 1, limit: 50 },
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

    async fetchData() {
      this.loading = true
      this.forbidden = false
      this.loadError = ''
      try {
        const res = await chatModerationApi.findModerationLog(this.$apiClient, {
          $limit: this.pagination.limit,
          $skip: (this.pagination.page - 1) * this.pagination.limit,
          $sort: { createdAt: -1 },
        })
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
  },
}
</script>

<style scoped>
.pager {
  margin-top: 16px;
  text-align: right;
}
</style>
