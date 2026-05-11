<template>
  <div class="app-container">
    <h2>Общий и категорийный чаты</h2>

    <el-tabs v-model="activeTab" @tab-click="onTabChange">
      <el-tab-pane label="Общий" name="common" />
      <el-tab-pane label="Категории" name="category" />
    </el-tabs>

    <div class="filters">
      <el-input v-model="filters.text" clearable placeholder="Поиск по тексту" />
      <el-input v-model="filters.companyId" clearable placeholder="companyId" />
      <el-input v-if="activeTab === 'category'" v-model="filters.categoryId" clearable placeholder="categoryId" />
      <el-button type="primary" @click="applyFilters">Применить</el-button>
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
      <el-table-column label="Действия" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="openJson(scope.row)">Открыть JSON</el-button>
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
    }
  },

  mounted() {
    this.fetchMessages()
  },

  methods: {
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
.filters {
  display: flex;
  gap: 12px;
  margin: 14px 0;
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
