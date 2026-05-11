<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-select v-model="filters.status" clearable placeholder="Статус модерации">
          <el-option label="Ожидает" value="pending" />
          <el-option label="Одобрен" value="approved" />
          <el-option label="Отклонен" value="rejected" />
          <el-option label="Заблокирован" value="banned" />
        </el-select>
        <el-input v-model.number="filters.truckId" clearable type="number" placeholder="truckId" class="w-140" />
        <el-button @click="onFilterClick"> Применить </el-button>
      </div>
      <div class="add-button" />
    </div>

    <el-table
      v-loading="isLoading"
      :data="truckModerations"
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
          <template v-if="scope.row.truck">
            <router-link :to="{ name: 'editTruck', params: { id: scope.row.truckId } }" target="_blank">
              {{ getTruckName(scope.row.truck) }} - #{{ scope.row.truckId }}
            </router-link>
          </template>
          <template v-else>-</template>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Отправитель">
        <template slot-scope="scope">
          <template v-if="scope.row.company">
            {{ scope.row.company.organizationName || scope.row.company.fullName }} - #{{ scope.row.companyId }}
          </template>
          <template v-else>-</template>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Статус" width="130">
        <template slot-scope="scope">
          {{ getModerationLabel(scope.row.status) }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="Комментарий">
        <template slot-scope="scope">
          {{ scope.row.comment || scope.row.moderationComment || '-' }}
        </template>
      </el-table-column>

      <el-table-column align="center" label="Дата" width="180">
        <template slot-scope="scope">
          {{ scope.row.createdAt | toDateFormat }}
        </template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="Действия" width="340">
        <template slot-scope="scope">
          <div class="el-button-group">
            <el-button size="small" type="success" @click="moderate(scope.row, 'approved')">Одобрить</el-button>
            <el-button size="small" type="warning" @click="moderate(scope.row, 'rejected')">Отклонить</el-button>
            <el-button size="small" type="danger" @click="moderate(scope.row, 'banned')">Блок</el-button>
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
  name: 'TruckModeration',

  mixins: [confirmUpdate],

  data() {
    return {
      truckModerations: [],
      filters: {
        status: 'pending',
        truckId: null,
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
      const moderationService = this.$apiClient.service('truck-moderation')

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

      const response = await moderationService.find({ query })
      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.truckModerations = data
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

    getModerationLabel(status) {
      const statuses = {
        pending: 'Ожидает',
        approved: 'Одобрен',
        rejected: 'Отклонен',
        banned: 'Заблокирован',
      }

      return statuses[status] || status || '-'
    },

    async moderate(row, status) {
      let comment = row.comment || ''

      try {
        const result = await this.$prompt('Комментарий модерации', 'Модерация грузовика', {
          confirmButtonText: 'Сохранить',
          cancelButtonText: 'Отмена',
          inputValue: comment,
        })
        comment = result.value
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Применить решение модерации?', 'Действие отменено')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('truck-moderation').patch(row.id, {
        status,
        comment,
      })

      this.$message({
        message: 'Статус модерации обновлен!',
        type: 'success',
      })

      return await this.fetchData()
    },

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить запись модерации?', 'Запись не удалена')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('truck-moderation').remove(id)
      this.$message({
        message: 'Запись модерации удалена!',
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

<style scoped>
.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.w-140 {
  width: 140px;
}
</style>
