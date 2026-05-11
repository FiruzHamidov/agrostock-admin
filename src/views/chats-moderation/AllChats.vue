<template>
  <div class="app-container">
    <h2>Все чаты</h2>

    <div class="filters">
      <el-select v-model="filters.chatType" clearable placeholder="Тип чата">
        <el-option label="P2P" value="P2P" />
        <el-option label="P2B" value="P2B" />
        <el-option label="B2B" value="B2B" />
      </el-select>
      <el-input v-model="filters.search" clearable placeholder="Поиск по user/company" />
      <el-date-picker
        v-model="filters.period"
        type="daterange"
        range-separator="до"
        start-placeholder="Дата от"
        end-placeholder="Дата до"
        value-format="yyyy-MM-dd"
      />
      <el-button type="primary" @click="onApplyFilters">Применить</el-button>
    </div>

    <el-alert v-if="forbidden" type="error" title="403: доступ запрещен" show-icon :closable="false" />
    <el-alert v-else-if="loadError" type="error" :title="loadError" show-icon :closable="false" />

    <el-table v-loading="loading" :data="items" stripe style="width: 100%" empty-text="Нет данных">
      <el-table-column prop="id" label="chatId" width="90" />
      <el-table-column label="chatType" width="100">
        <template slot-scope="scope">{{ scope.row._chatType }}</template>
      </el-table-column>
      <el-table-column label="Участник #1" min-width="220">
        <template slot-scope="scope">{{ participantLabel(scope.row, 0) }}</template>
      </el-table-column>
      <el-table-column label="Участник #2" min-width="220">
        <template slot-scope="scope">{{ participantLabel(scope.row, 1) }}</template>
      </el-table-column>
      <el-table-column label="Последнее сообщение" min-width="220">
        <template slot-scope="scope">{{ scope.row.lastMessage && scope.row.lastMessage.text ? scope.row.lastMessage.text : '-' }}</template>
      </el-table-column>
      <el-table-column label="lastMessageDate" min-width="170">
        <template slot-scope="scope">{{ scope.row.lastMessage && scope.row.lastMessage.createdAt ? scope.row.lastMessage.createdAt : scope.row.updatedAt }}</template>
      </el-table-column>
      <el-table-column label="Кол-во сообщений" min-width="120">
        <template slot-scope="scope">{{ scope.row.messagesCount || scope.row.chatMessagesCount || '-' }}</template>
      </el-table-column>
      <el-table-column label="Action" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openChat(scope.row.id)">Открыть</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pagination.limit"
        :current-page.sync="pagination.page"
        @current-change="fetchChats"
      />
    </div>
  </div>
</template>

<script>
import { chatModerationApi, classifyChatType } from '@/api/chat-moderation'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'AdminChatsAll',

  data() {
    return {
      loading: false,
      loadError: '',
      forbidden: false,
      items: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 20,
      },
      filters: {
        chatType: '',
        search: '',
        period: [],
      },
    }
  },

  mounted() {
    this.fetchChats()
  },

  methods: {
    participantLabel(chat, index) {
      const companies = chat.chatCompanies || []
      const users = chat.chatUsers || chat.users || []
      if (companies[index]) {
        return `${companies[index].organizationName || 'company'} (${companies[index].id})`
      }
      if (users[index]) {
        const fullName = [users[index].firstName, users[index].lastName].filter(Boolean).join(' ')
        return `${fullName || users[index].email || 'user'} (${users[index].id})`
      }
      return '-'
    },

    buildQuery() {
      const query = {
        $limit: this.pagination.limit,
        $skip: (this.pagination.page - 1) * this.pagination.limit,
        $sort: { updatedAt: -1 },
      }

      if (this.filters.search) {
        query.search = this.filters.search
      }
      if (this.filters.period && this.filters.period.length === 2) {
        query.dateFrom = this.filters.period[0]
        query.dateTo = this.filters.period[1]
      }

      return query
    },

    async fetchChats() {
      this.loading = true
      this.loadError = ''
      this.forbidden = false
      try {
        const res = await chatModerationApi.findChats(this.$apiClient, this.buildQuery())
        const raw = res.data || []
        let mapped = raw.map(item => ({ ...item, _chatType: classifyChatType(item) }))
        if (this.filters.chatType) {
          mapped = mapped.filter(x => x._chatType === this.filters.chatType)
        }
        this.items = mapped
        this.total = res.total || mapped.length
      } catch (error) {
        if (error && Number(error.code) === 403) {
          this.forbidden = true
        }
        const parsed = handleApiError(this, error, 'Не удалось загрузить чаты')
        this.loadError = parsed.message
      } finally {
        this.loading = false
      }
    },

    onApplyFilters() {
      this.pagination.page = 1
      this.fetchChats()
    },

    openChat(id) {
      this.$router.push({ name: 'AdminChatsDetails', params: { id: String(id) } })
    },
  },
}
</script>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: 160px 1fr 360px 140px;
  gap: 12px;
  margin: 16px 0;
}

.pager {
  margin-top: 16px;
  text-align: right;
}
</style>
