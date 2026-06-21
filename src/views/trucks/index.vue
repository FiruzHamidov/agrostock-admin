<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-input v-model="filters.search" placeholder="Поиск" />
        <el-select v-model="filters.moderationStatus" clearable placeholder="Модерация" class="m-l-1">
          <el-option label="Ожидает" value="pending" />
          <el-option label="Одобрен" value="approved" />
          <el-option label="Отклонен" value="rejected" />
          <el-option label="Заблокирован" value="banned" />
        </el-select>
        <el-button @click="onFilterClick"> Применить </el-button>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addTruck' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
      </div>
    </div>

    <el-table
      v-loading="isLoading"
      :data="trucks"
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

      <el-table-column align="center" label="Грузовик">
        <template slot-scope="scope">
          {{ getTruckName(scope.row) }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="Владелец">
        <template slot-scope="scope">
          {{ scope.row.company ? scope.row.company.fullName || scope.row.company.organizationName : '-' }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="Статус" width="130">
        <template slot-scope="scope">
          {{ getStatusLabel(scope.row.status) }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="Модерация" width="140">
        <template slot-scope="scope">
          {{ getModerationLabel(scope.row.moderationStatus) }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="Дата" width="180">
        <template slot-scope="scope">
          {{ scope.row.createdAt | toDateFormat }}
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="Действия" width="300">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'readTruck', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
            <router-link
              :to="{ name: 'editTruck', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-edit" />
            </router-link>
            <el-button
              v-if="scope.row.status !== 'banned'"
              size="small"
              @click="changeTruckStatus(scope.row.id, 'banned')"
            >
              Блок
            </el-button>
            <el-button v-else size="small" @click="changeTruckStatus(scope.row.id, 'active')">
              Разблок
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">
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
  name: 'Trucks',

  mixins: [confirmUpdate],

  data() {
    return {
      trucks: [],
      filters: {
        search: '',
        moderationStatus: '',
      },
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
      const trucksService = this.$apiClient.service('trucks')

      this.isLoading = true
      const query = {
        $limit: this.limit,
        $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
        $sort: {
          createdAt: -1,
        },
      }

      Object.keys(this.filters).forEach(key => {
        if (this.filters[key]) {
          query[key] = this.filters[key]
        }
      })

      const response = await trucksService.find({ query })
      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.trucks = data
      this.total = total
      this.isLoading = false

      return true
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },

    getTruckName(truck) {
      return truck.name || truck.title || truck.model || truck.number || `#${truck.id}`
    },

    getStatusLabel(status) {
      const statuses = {
        active: 'Активен',
        offline: 'Оффлайн',
        banned: 'Заблокирован',
      }

      return statuses[status] || status || '-'
    },

    getModerationLabel(status) {
      const statuses = {
        pending: 'Ожидает',
        approved: 'Одобрен',
        rejected: 'Отклонен',
        banned: 'Заблокирован',
      }

      return statuses[status] || status || '-'
    },

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить грузовик?', 'Грузовик не удален')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('trucks').remove(id)
      this.$message({
        message: 'Грузовик удален!',
        type: 'success',
      })

      return await this.fetchData()
    },

    async changeTruckStatus(id, status) {
      try {
        await this.confirmUpdate('Изменить статус грузовика?', 'Статус не изменен')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('trucks').patch(id, { status })
      this.$message({
        message: 'Статус грузовика обновлен!',
        type: 'success',
      })

      return await this.fetchData()
    },

    onFilterClick() {
      this.page = 1
      this.fetchData()
    },
  },
}
</script>
