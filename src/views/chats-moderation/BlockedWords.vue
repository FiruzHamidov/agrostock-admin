<template>
  <div class="app-container">
    <div class="header-row">
      <h2>Стоп-слова</h2>
      <el-button type="primary" @click="openCreate">Добавить</el-button>
    </div>
    <el-alert v-if="notAuthenticated" :closable="false" type="error" title="401: требуется авторизация" show-icon />
    <el-alert v-else-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="notFound" :closable="false" type="error" title="404: сервис не найден" show-icon />
    <el-alert v-else-if="loadError" :closable="false" :title="loadError" type="error" show-icon />

    <el-table v-loading="loading" :data="items" stripe empty-text="Нет стоп-слов">
      <el-table-column prop="word" label="Слово" min-width="220" />
      <el-table-column prop="isActive" label="Активно" width="100" />
      <el-table-column prop="createdByUserId" label="Кем создано" width="140" />
      <el-table-column prop="createdAt" label="Дата" min-width="170" />
      <el-table-column label="Действия" width="320" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" icon="el-icon-view" @click="openJson(scope.row)" />
          <el-button size="mini" icon="el-icon-edit" @click="openEdit(scope.row)" />
          <el-button size="mini" type="warning" @click="toggleActive(scope.row)">
            {{ scope.row.isActive ? 'Деактивировать' : 'Активировать' }}
          </el-button>
          <el-button size="mini" type="danger" @click="removeItem(scope.row)">Удалить</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="form.id ? 'Редактирование' : 'Добавить стоп-слово'" width="460px">
      <el-form label-position="top">
        <el-form-item label="word">
          <el-input v-model="form.word" placeholder="Введите слово" />
        </el-form-item>
        <el-form-item label="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="submitForm">Сохранить</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="jsonDialogVisible" title="JSON стоп-слова" width="520px">
      <pre>{{ selectedJson }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import { chatModerationApi } from '@/api/chat-moderation'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'AdminChatsBlockedWords',

  data() {
    return {
      loading: false,
      notAuthenticated: false,
      forbidden: false,
      notFound: false,
      loadError: '',
      items: [],
      dialogVisible: false,
      jsonDialogVisible: false,
      selectedJson: '',
      form: {
        id: null,
        word: '',
        isActive: true,
      },
    }
  },

  mounted() {
    this.fetchItems()
  },

  methods: {
    async fetchItems() {
      this.loading = true
      this.notAuthenticated = false
      this.forbidden = false
      this.notFound = false
      this.loadError = ''
      try {
        const res = await chatModerationApi.findBlockedWords(this.$apiClient, {
          $limit: 200,
          $sort: { createdAt: -1 },
        })
        this.items = res.data || []
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
        const parsed = handleApiError(this, error, 'Не удалось загрузить стоп-слова')
        this.loadError = parsed.message
      } finally {
        this.loading = false
      }
    },

    openCreate() {
      this.form = { id: null, word: '', isActive: true }
      this.dialogVisible = true
    },

    openEdit(row) {
      this.form = { id: row.id, word: row.word, isActive: !!row.isActive }
      this.dialogVisible = true
    },

    openJson(row) {
      this.selectedJson = JSON.stringify(row, null, 2)
      this.jsonDialogVisible = true
    },

    async submitForm() {
      if (!this.form.word) {
        this.$message({ type: 'warning', message: 'Заполните word' })
        return
      }

      try {
        if (this.form.id) {
          await chatModerationApi.patchBlockedWord(this.$apiClient, this.form.id, {
            word: this.form.word,
            isActive: this.form.isActive,
          })
          this.$message({ type: 'success', message: 'Стоп-слово обновлено' })
        } else {
          await chatModerationApi.createBlockedWord(this.$apiClient, {
            word: this.form.word,
            isActive: this.form.isActive,
          })
          this.$message({ type: 'success', message: 'Стоп-слово добавлено' })
        }
        this.dialogVisible = false
        await this.fetchItems()
      } catch (error) {
        handleApiError(this, error, 'Не удалось сохранить стоп-слово')
      }
    },

    async toggleActive(row) {
      try {
        await chatModerationApi.patchBlockedWord(this.$apiClient, row.id, {
          isActive: !row.isActive,
        })
        this.$message({ type: 'success', message: 'Статус обновлен' })
        await this.fetchItems()
      } catch (error) {
        handleApiError(this, error, 'Не удалось обновить статус')
      }
    },

    async removeItem(row) {
      try {
        await this.$confirm('Удалить стоп-слово? Действие необратимо.', 'Подтверждение', {
          type: 'warning',
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
        })
      } catch (e) {
        return
      }

      try {
        await chatModerationApi.removeBlockedWord(this.$apiClient, row.id)
        this.$message({ type: 'success', message: 'Стоп-слово удалено' })
        await this.fetchItems()
      } catch (error) {
        handleApiError(this, error, 'Не удалось удалить стоп-слово')
      }
    },
  },
}
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

pre {
  max-height: 65vh;
  overflow: auto;
  background: #f7f7f7;
  padding: 12px;
}
</style>
