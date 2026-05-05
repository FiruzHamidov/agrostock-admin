<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-input v-model="filters.email" clearable placeholder="E-mail" />
        <el-input v-model="filters.username" clearable placeholder="Username" />
        <el-input v-model="filters.fullName" clearable placeholder="ФИО" />
        <el-select v-model="filters.type" clearable placeholder="Роль">
          <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-select v-model="filters.status" clearable placeholder="Статус">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button @click="onFilterClick">Применить</el-button>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addUser' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
      </div>
    </div>

    <el-table
      v-loading="isLoading"
      :data="users"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="E-mail">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Username">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="ФИО" min-width="170">
        <template slot-scope="scope">
          {{ scope.row.fullName }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Роль" width="120">
        <template slot-scope="scope">
          {{ scope.row.type }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Статус" width="120">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Онлайн" width="100">
        <template slot-scope="scope">
          {{ scope.row.isOnline ? 'Да' : 'Нет' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Действия" min-width="160">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'editUser', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-edit" />
            </router-link>
            <el-button size="small" @click="handleDelete(scope.row.id)">
              <i class="el-icon-delete" />
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page.sync="page"
      :page-size="limit"
      :total="total"
      :page-sizes="[10, 20, 50]"
      background
      layout="sizes, prev, pager, next, total"
      @size-change="handleSizeChange"
      @current-change="fetchData"
    />
  </div>
</template>

<script>
import confirmUpdate from '@/mixins/confirmUpdate'

export default {
  name: 'Users',

  mixins: [confirmUpdate],

  data() {
    return {
      users: [],
      filters: {
        email: '',
        username: '',
        fullName: '',
        type: '',
        status: '',
      },
      typeOptions: ['company', 'admin', 'moderator', 'superadmin'],
      statusOptions: ['active', 'blocked'],
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.isLoading = true
      const usersService = this.$apiClient.service('users')

      const query = {
        $limit: this.limit,
        $skip: this.page > 1 ? (this.page - 1) * this.limit : 0,
        $sort: {
          createdAt: -1,
        },
      }

      Object.keys(this.filters).forEach(key => {
        if (!this.filters[key]) {
          return
        }

        if (key === 'email' || key === 'username' || key === 'fullName') {
          query[key] = { $search: this.filters[key] }
          return
        }

        query[key] = this.filters[key]
      })

      const response = await usersService.find({ query })
      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.users = data
      this.total = total
      this.isLoading = false
      return true
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },

    async handleDelete(userId) {
      try {
        await this.confirmUpdate('Точно удалить пользователя?', 'Пользователь не удален')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('users').remove(userId)

        this.$message({
          message: 'Пользователь удален',
          type: 'success',
        })
      } catch (err) {
        const code = err.code || (err.data && err.data.code)
        let message = err.message || 'Не удалось удалить пользователя'

        if (code === 401) {
          message = 'Сессия истекла. Войдите снова'
        } else if (code === 403) {
          message = 'Недостаточно прав для удаления пользователя'
        }

        this.$message({
          message,
          type: 'error',
        })
      }

      return await this.fetchData()
    },

    onFilterClick() {
      this.page = 1
      this.fetchData()
    },
  },
}
</script>
