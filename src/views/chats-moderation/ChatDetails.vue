<template>
  <div class="app-container">
    <div class="header-row">
      <h2>Детали чата #{{ chatId }}</h2>
      <el-button type="primary" icon="el-icon-plus" @click="openCreateMessage">Добавить сообщение</el-button>
    </div>

    <el-alert v-if="notAuthenticated" :closable="false" type="error" title="401: требуется авторизация" show-icon />
    <el-alert v-else-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="notFound" :closable="false" type="error" title="404: сервис не найден" show-icon />
    <el-alert v-else-if="loadError" :closable="false" :title="loadError" type="error" show-icon />

    <el-card v-if="chat" class="mb-3">
      <div slot="header">Участники</div>
      <div class="participants">
        <el-tag v-for="p in participants" :key="p.key" type="info">{{ p.label }}</el-tag>
      </div>
    </el-card>

    <el-table v-loading="loading" :data="messages" stripe empty-text="Нет сообщений">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="text" label="Текст" min-width="260" />
      <el-table-column label="Отправитель" min-width="160">
        <template slot-scope="scope">{{ senderLabel(scope.row) }}</template>
      </el-table-column>
      <el-table-column prop="type" label="Тип" width="100" />
      <el-table-column prop="isRead" label="Прочитано" width="90" />
      <el-table-column prop="moderationStatus" label="Модерация" min-width="140" />
      <el-table-column prop="isBlocked" label="Блок" width="100" />
      <el-table-column prop="createdAt" label="Дата" min-width="170" />
      <el-table-column label="Действия" width="360" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-view" @click="showJson(scope.row)" />
          <el-button size="mini" icon="el-icon-edit" @click="openEditMessage(scope.row)" />
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

    <el-dialog :visible.sync="formDialogVisible" :title="form.id ? 'Редактировать сообщение' : 'Добавить сообщение'" width="560px">
      <el-form label-position="top">
        <el-form-item label="Текст">
          <el-input v-model="form.text" :rows="4" type="textarea" placeholder="Введите сообщение" />
        </el-form-item>
        <el-form-item label="fileId">
          <el-input v-model.number="form.fileId" clearable type="number" placeholder="Опционально" />
        </el-form-item>
        <template v-if="form.id">
          <el-form-item label="Тип">
            <el-select v-model="form.type" clearable class="full-width" placeholder="Тип">
              <el-option label="system" value="system" />
              <el-option label="company" value="company" />
            </el-select>
          </el-form-item>
          <el-form-item label="Статус модерации">
            <el-select v-model="form.moderationStatus" clearable class="full-width" placeholder="Статус">
              <el-option label="Ожидает" value="pending" />
              <el-option label="Одобрено" value="approved" />
              <el-option label="Заблокировано" value="blocked" />
            </el-select>
          </el-form-item>
          <el-form-item label="Прочитано">
            <el-switch v-model="form.isRead" />
          </el-form-item>
          <el-form-item label="Заблокировано">
            <el-switch v-model="form.isBlocked" />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="formDialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="submitMessageForm">Сохранить</el-button>
      </span>
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
      notAuthenticated: false,
      forbidden: false,
      notFound: false,
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
      formDialogVisible: false,
      form: this.getEmptyForm(),
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
    getEmptyForm() {
      return {
        id: null,
        text: '',
        fileId: '',
        type: '',
        moderationStatus: '',
        isRead: false,
        isBlocked: false,
      }
    },

    async bootstrap() {
      await Promise.all([this.fetchChat(), this.fetchMessages()])
    },

    async fetchChat() {
      try {
        this.chat = await chatModerationApi.getChat(this.$apiClient, this.chatId)
      } catch (error) {
        if (error && Number(error.code) === 401) {
          this.notAuthenticated = true
        }
        if (error && Number(error.code) === 403) {
          this.forbidden = true
        }
        if (error && Number(error.code) === 404) {
          this.notFound = true
        }
        const parsed = handleApiError(this, error, 'Не удалось загрузить чат')
        this.loadError = parsed.message
      }
    },

    async fetchMessages() {
      this.loading = true
      this.notAuthenticated = false
      this.forbidden = false
      this.notFound = false
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
        if (error && Number(error.code) === 401) {
          this.notAuthenticated = true
        }
        if (error && Number(error.code) === 403) {
          this.forbidden = true
        }
        if (error && Number(error.code) === 404) {
          this.notFound = true
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

    openCreateMessage() {
      this.form = this.getEmptyForm()
      this.formDialogVisible = true
    },

    openEditMessage(message) {
      this.form = {
        id: message.id,
        text: message.text || '',
        fileId: message.fileId || '',
        type: message.type || '',
        moderationStatus: message.moderationStatus || '',
        isRead: !!message.isRead,
        isBlocked: !!message.isBlocked,
      }
      this.formDialogVisible = true
    },

    buildMessagePayload() {
      const payload = {
        text: this.form.text,
      }

      if (!this.form.id) {
        payload.chatId = this.chatId
      }
      if (this.form.fileId) {
        payload.fileId = this.form.fileId
      }
      if (this.form.id) {
        payload.type = this.form.type
        payload.moderationStatus = this.form.moderationStatus
        payload.isRead = this.form.isRead
        payload.isBlocked = this.form.isBlocked
      }

      return payload
    },

    async submitMessageForm() {
      if (!this.form.text || !this.form.text.trim()) {
        this.$message({ type: 'warning', message: 'Заполните текст сообщения' })
        return
      }

      try {
        const payload = this.buildMessagePayload()
        if (this.form.id) {
          await chatModerationApi.patchChatMessage(this.$apiClient, this.form.id, payload)
          this.$message({ type: 'success', message: 'Сообщение обновлено' })
        } else {
          await chatModerationApi.createChatMessage(this.$apiClient, payload)
          this.$message({ type: 'success', message: 'Сообщение создано' })
        }
        this.formDialogVisible = false
        await this.fetchMessages()
      } catch (error) {
        handleApiError(this, error, 'Не удалось сохранить сообщение')
      }
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.mb-3 {
  margin-bottom: 12px;
}

.full-width {
  width: 100%;
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
