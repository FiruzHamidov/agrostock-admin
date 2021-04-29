<template>
  <div class="app-container">
    <div class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4">
      <div class="filters">
        <div>
          <el-input
            v-model="searchField"
            clearable
            placeholder="E-mail">
            <el-button 
              slot="append"
              icon="el-icon-search"
              @click="fetchData()" />
          </el-input>
        </div>
      </div>
    </div>
    <el-table
      v-loading="isLoading"
      :data="users"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>
      <el-table-column 
        align="center" 
        label="ID" 
        width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column 
        align="center" 
        label="E-mail">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column 
        align="center" 
        label="Роль"
        width="200">
        <template slot-scope="scope">
          {{ scope.row.role }}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Действия"
        min-width="150">
        <template slot-scope="scope">
          <div class="el-button-group">
            <el-button 
              size="small" 
              @click="handleDelete(scope.row.id)"><i class="el-icon-delete"/></el-button>
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
      @current-change="fetchData"/>
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
      searchField: '',
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
        $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
      }
      if (this.searchField !== '') {
        query.email = { $search: this.searchField }
      }

      const response = await usersService.find({
        query,
      })

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
        await this.confirmUpdate('Точно удалить этот аккаунт?', 'Аккаунт удалён')
      } catch (err) {
        return false
      }

      const usersService = this.$apiClient.service('users')

      try {
        await usersService.remove(userId)

        this.$message({
          message: 'Аккаунт удалён',
          type: 'success',
        })

        return await this.fetchData()
      } catch (err) {
        this.$message({
          message: 'Не удалось удалить аккаунт',
          type: 'warning',
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.vue-star-rating {
  display: flex !important;
  width: 100%;
  justify-content: center;
}
</style>
