<template>
  <div class="app-container">
    <h2>Общий и категорийный чаты</h2>

    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane label="Общий" name="common" />
      <el-tab-pane label="Категории" name="category" />
    </el-tabs>

    <div class="filters">
      <div class="filters-left">
        <el-input v-model="filters.text" clearable placeholder="Поиск по тексту" />
        <el-input v-model="filters.companyId" clearable placeholder="companyId" />
        <el-input v-if="activeTab === 'category'" v-model="filters.categoryId" clearable placeholder="categoryId" />
        <el-button type="primary" @click="applyFilters">Применить</el-button>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="openCreateMessage">Добавить</el-button>
    </div>
    <el-alert v-if="notAuthenticated" :closable="false" type="error" title="401: требуется авторизация" show-icon />
    <el-alert v-else-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="notFound" :closable="false" type="error" title="404: сервис не найден" show-icon />
    <el-alert v-else-if="loadError" :closable="false" :title="loadError" type="error" show-icon />

    <el-table v-loading="loading" :data="messages" stripe empty-text="Нет сообщений">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="type" label="Тип" width="100" />
      <el-table-column prop="categoryId" label="Категория" width="110" />
      <el-table-column prop="companyId" label="Компания" width="110" />
      <el-table-column prop="text" label="Текст" min-width="280" />
      <el-table-column prop="createdAt" label="Дата" min-width="170" />
      <el-table-column label="Действия" width="320" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-view" @click="openJson(scope.row)" />
          <el-button size="mini" icon="el-icon-edit" @click="openEditMessage(scope.row)" />
          <el-button size="mini" type="danger" @click="removeMessage(scope.row)">Удалить</el-button>
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
        <el-form-item label="Тип">
          <el-select v-model="form.type" class="full-width" placeholder="Тип">
            <el-option label="Общий" value="common" />
            <el-option label="Категория" value="category" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'category'" label="categoryId">
          <el-input v-model.number="form.categoryId" type="number" placeholder="ID категории" />
        </el-form-item>
        <el-form-item label="companyId">
          <el-input v-model.number="form.companyId" clearable type="number" placeholder="Опционально" />
        </el-form-item>
        <template v-if="form.id">
          <el-form-item label="Статус модерации">
            <el-select v-model="form.moderationStatus" clearable class="full-width" placeholder="Статус">
              <el-option label="Ожидает" value="pending" />
              <el-option label="Одобрено" value="approved" />
              <el-option label="Заблокировано" value="blocked" />
            </el-select>
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
  name: 'AdminChatsCommon',

  data() {
    return {
      activeTab: 'common',
      loading: false,
      notAuthenticated: false,
      forbidden: false,
      notFound: false,
      loadError: '',
      messages: [],
      total: 0,
      pagination: { page: 1, limit: 50 },
      filters: {
        text: '',
        companyId: '',
        categoryId: '',
      },
      jsonDialogVisible: false,
      selectedJson: '',
      formDialogVisible: false,
      form: this.getEmptyForm(),
    }
  },

  mounted() {
    this.fetchMessages()
  },

  methods: {
    getEmptyForm() {
      return {
        id: null,
        text: '',
        type: this.activeTab || 'common',
        categoryId: '',
        companyId: '',
        moderationStatus: '',
        isBlocked: false,
      }
    },

    buildQuery() {
      const query = {
        $limit: this.pagination.limit,
        $skip: (this.pagination.page - 1) * this.pagination.limit,
        $sort: { createdAt: -1 },
        type: this.activeTab,
      }

      if (this.filters.companyId) query.companyId = this.filters.companyId
      if (this.filters.text) query.text = this.filters.text
      if (this.activeTab === 'category' && this.filters.categoryId) {
        query.categoryId = this.filters.categoryId
      }

      return query
    },

    async fetchMessages() {
      this.loading = true
      this.notAuthenticated = false
      this.forbidden = false
      this.notFound = false
      this.loadError = ''
      try {
        const res = await chatModerationApi.findCommonMessages(this.$apiClient, this.buildQuery())
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
        const parsed = handleApiError(this, error, 'Не удалось загрузить сообщения общего/категорийного чата')
        this.loadError = parsed.message
      } finally {
        this.loading = false
      }
    },

    onTabChange() {
      this.pagination.page = 1
      this.fetchMessages()
    },

    applyFilters() {
      this.pagination.page = 1
      this.fetchMessages()
    },

    openJson(row) {
      this.selectedJson = JSON.stringify(row, null, 2)
      this.jsonDialogVisible = true
    },

    openCreateMessage() {
      this.form = this.getEmptyForm()
      this.formDialogVisible = true
    },

    openEditMessage(row) {
      this.form = {
        id: row.id,
        text: row.text || '',
        type: row.type || this.activeTab || 'common',
        categoryId: row.categoryId || '',
        companyId: row.companyId || '',
        moderationStatus: row.moderationStatus || '',
        isBlocked: !!row.isBlocked,
      }
      this.formDialogVisible = true
    },

    buildMessagePayload() {
      const payload = {
        text: this.form.text,
        type: this.form.type,
      }

      if (this.form.type === 'category') {
        payload.categoryId = this.form.categoryId
      }
      if (this.form.companyId) {
        payload.companyId = this.form.companyId
      }
      if (this.form.id) {
        payload.moderationStatus = this.form.moderationStatus
        payload.isBlocked = this.form.isBlocked
      }

      return payload
    },

    async submitMessageForm() {
      if (!this.form.text || !this.form.text.trim()) {
        this.$message({ type: 'warning', message: 'Заполните текст сообщения' })
        return
      }
      if (this.form.type === 'category' && !this.form.categoryId) {
        this.$message({ type: 'warning', message: 'Укажите categoryId' })
        return
      }

      try {
        const payload = this.buildMessagePayload()
        if (this.form.id) {
          await chatModerationApi.patchCommonMessage(this.$apiClient, this.form.id, payload)
          this.$message({ type: 'success', message: 'Сообщение обновлено' })
        } else {
          await chatModerationApi.createCommonMessage(this.$apiClient, payload)
          this.$message({ type: 'success', message: 'Сообщение создано' })
        }
        this.formDialogVisible = false
        await this.fetchMessages()
      } catch (error) {
        handleApiError(this, error, 'Не удалось сохранить сообщение')
      }
    },

    async removeMessage(row) {
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
        await chatModerationApi.removeCommonMessage(this.$apiClient, row.id)
        this.$message({ type: 'success', message: `Сообщение ${row.id} удалено` })
        await this.fetchMessages()
      } catch (error) {
        handleApiError(this, error, 'Не удалось удалить сообщение')
      }
    },
  },
}
</script>

<style scoped>
.pager {
  margin-top: 16px;
  text-align: right;
}

.filters {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.filters-left {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filters-left .el-input {
  width: 220px;
}

.full-width {
  width: 100%;
}

pre {
  max-height: 65vh;
  overflow: auto;
  background: #f7f7f7;
  padding: 12px;
}
</style>
