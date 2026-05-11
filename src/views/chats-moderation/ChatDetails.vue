<template>
  <div class="app-container">
    <h2>Детали чата #{{ chatId }}</h2>

    <el-alert v-if="forbidden" type="error" title="403: доступ запрещен" :closable="false" show-icon />
    <el-alert v-else-if="loadError" :title="loadError" type="error" :closable="false" show-icon />

    <el-card v-if="chat" class="mb-3">
      <div slot="header">Участники</div>
      <div class="participants">
        <el-tag v-for="p in participants" :key="p.key" type="info">{{ p.label }}</el-tag>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="messages" stripe empty-text="Нет сообщений">
      <el-table-column prop="id" label="id" width="90" />
      <el-table-column prop="text" label="text" min-width="260" />
      <el-table-column label="sender" min-width="160">
        <template slot-scope="scope">{{ senderLabel(scope.row) }}</template>
      </el-table-column>
      <el-table-column prop="type" label="type" width="100" />
      <el-table-column prop="isRead" label="isRead" width="90" />
      <el-table-column prop="moderationStatus" label="moderationStatus" min-width="140" />
      <el-table-column prop="isBlocked" label="isBlocked" width="100" />
      <el-table-column prop="createdAt" label="createdAt" min-width="170" />
      <el-table-column label="Actions" width="340" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="showJson(scope.row)">Открыть JSON</el-button>
          <el-button size="mini" type="warning" @click="toggleBlock(scope.row)">
            {{ scope.row.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
          </el-button>
          <el-button size="mini" type="danger" @click="deleteMessage(scope.row)">Удалить</el-button>
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
        @current-change="fetchMessages"
      />
    </div>

    <el-dialog :visible.sync="jsonDialogVisible" title="JSON сообщения" width="60%">
      <pre>{{ selectedJson }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import { chatModerationApi } from '@/api/chat-moderation'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'AdminChatsDetails',

  data() {
    return {
      loading: false,
      forbidden: false,
      loadError: '',
      chat: null,
      messages: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 50,
      },
      jsonDialogVisible: false,
      selectedJson: '',
    }
  },

  computed: {
    chatId() {
      return this.$route.params.id
    },

    participants() {
      const result = []
      ;(this.chat && this.chat.chatCompanies ? this.chat.chatCompanies : []).forEach(c => {
        result.push({ key: `company-${c.id}`, label: `company: ${c.organizationName || c.id}` })
      })
      ;(this.chat && this.chat.chatUsers ? this.chat.chatUsers : []).forEach(u => {
        result.push({ key: `user-${u.id}`, label: `user: ${u.email || u.id}` })
      })
      return result
    },
  },

  mounted() {
    this.bootstrap()
  },

  methods: {
    async bootstrap() {
      await Promise.all([this.fetchChat(), this.fetchMessages()])
    },

    async fetchChat() {
      try {
        this.chat = await chatModerationApi.getChat(this.$apiClient, this.chatId)
      } catch (error) {
        if (error && Number(error.code) === 403) {
          this.forbidden = true
        }
        const parsed = handleApiError(this, error, 'Не удалось загрузить чат')
        this.loadError = parsed.message
      }
    },

    async fetchMessages() {
      this.loading = true
      this.loadError = ''
      try {
        const res = await chatModerationApi.findChatMessages(this.$apiClient, {
          chatId: this.chatId,
          $limit: this.pagination.limit,
          $skip: (this.pagination.page - 1) * this.pagination.limit,
          $sort: { createdAt: -1 },
        })
        this.messages = res.data || []
        this.total = res.total || 0
      } catch (error) {
        if (error && Number(error.code) === 403) {
          this.forbidden = true
        }
        const parsed = handleApiError(this, error, 'Не удалось загрузить сообщения чата')
        this.loadError = parsed.message
      } finally {
        this.loading = false
      }
    },

    senderLabel(message) {
      if (message.userId) return `user:${message.userId}`
      if (message.companyId) return `company:${message.companyId}`
      return '-'
    },

    showJson(message) {
      this.selectedJson = JSON.stringify(message, null, 2)
      this.jsonDialogVisible = true
    },

    async deleteMessage(message) {
      try {
        await this.$confirm('Удалить сообщение? Действие необратимо.', 'Подтверждение', {
          type: 'warning',
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
        })
      } catch (e) {
        return
      }

      try {
        await chatModerationApi.removeChatMessage(this.$apiClient, message.id)
        this.$message({ type: 'success', message: `Сообщение ${message.id} удалено` })
        await this.fetchMessages()
      } catch (error) {
        handleApiError(this, error, 'Не удалось удалить сообщение')
      }
    },

    async toggleBlock(message) {
      const nextStatus = message.isBlocked ? 'approved' : 'blocked'
      const reason = message.isBlocked ? 'Unblocked by moderator' : 'Violation'

      try {
        let moderationId = message.moderationId || message.chatMessageModerationId

        if (!moderationId) {
          const found = await chatModerationApi.findModerationLog(this.$apiClient, {
            entityType: 'chats-messages',
            entityId: message.id,
            $limit: 1,
            $sort: { createdAt: -1 },
          })
          moderationId = found && found.data && found.data[0] ? found.data[0].id : null
        }

        if (!moderationId) {
          throw new Error('Не найдена запись модерации для сообщения')
        }

        await chatModerationApi.patchModeration(this.$apiClient, moderationId, {
          status: nextStatus,
          reason,
        })

        this.$message({ type: 'success', message: `Статус модерации: ${nextStatus}` })
        await this.fetchMessages()
      } catch (error) {
        handleApiError(this, error, 'Не удалось обновить модерацию сообщения')
      }
    },
  },
}
</script>

<style scoped>
.participants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.pager {
  margin-top: 16px;
  text-align: right;
}

pre {
  max-height: 65vh;
  overflow: auto;
  background: #f7f7f7;
  padding: 12px;
}
</style>
