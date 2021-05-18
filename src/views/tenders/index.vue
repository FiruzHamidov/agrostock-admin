<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-input v-model="filters.search" placeholder="Название" />
        <el-button @click="onFilterClick"> Применить </el-button>
      </div>
      <div class="add-button" />
    </div>
    <el-table
      v-loading="isLoading"
      :data="tenders"
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
      <el-table-column align="center" label="Название">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Тип">
        <template slot-scope="scope">
          {{ scope.row.type === 'sell' ? 'Продажа' : 'Покупка' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Начальная цена">
        <template slot-scope="scope">
          {{ scope.row.startPrice }} {{ currencySymbols[scope.row.currency] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Дата" width="300">
        <template slot-scope="scope">
          {{ scope.row.dateStart | tenderTimeFormat }} - {{ scope.row.dateEnd | tenderTimeFormat }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Статус">
        <template slot-scope="scope">
          {{ statuses[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="Действия" width="200">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'editTender', params: { id: scope.row.id } }"
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
import moment from 'moment'

import { currencySymbols } from '@/utils/variables'

export default {
  name: 'Tenders',

  filters: {
    tenderTimeFormat: val => {
      if (!moment(val).isValid()) {
        return val
      }
      return moment(val).format('YYYY-MM-DD HH:mm')
    },
  },

  mixins: [confirmUpdate],

  data() {
    return {
      tenders: [],
      filters: {},
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
      currencySymbols,
      statuses: {
        wait: 'В ожидание',
        active: 'Активен',
        cancelled: 'Отменен',
        suspended: 'Приостановлен',
        doneWithWinner: 'Завершен (есть победитель)',
        doneWithoutWinner: 'Завершен (нет победителя)',
        banned: 'Заблокирован',
      },
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const tendersService = this.$apiClient.service('tenders')

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
      const response = await tendersService.find({
        query,
      })

      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.tenders = data
      this.total = total

      this.isLoading = false
      return true
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },

    updateActive() {},

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить категорию?', 'Категория не удалена')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('tenders').remove(id)
      this.$message({
        message: 'Категория удалена!',
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
