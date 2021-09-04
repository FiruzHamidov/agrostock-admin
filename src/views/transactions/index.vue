<template>
  <div class="app-container">
    <el-table
      v-loading="isLoading"
      :data="transactions"
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
      <el-table-column align="center" label="Сумма">
        <template slot-scope="scope">
          {{ scope.row.sum }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Тип">
        <template slot-scope="scope">
          {{ types[scope.row.type] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Тип транзакции">
        <template slot-scope="scope">
          {{ scope.row.transactionType === 'replenishment' ? 'Пополнение' : 'Списание' }}
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
import moment from 'moment'

export default {
  name: 'Transactions',

  filters: {
    tenderTimeFormat: val => {
      if (!moment(val).isValid()) {
        return val
      }
      return moment(val).format('YYYY-MM-DD HH:mm')
    },
  },

  data() {
    return {
      transactions: [],
      filters: {},
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
      types: {
        tender: 'Тендер',
        'tender-commission': 'Тендерная комиссия',
        deal: 'Сделка',
        user: 'Пользователь',
      },
      statuses: {
        wait: 'В ожидание',
        active: 'Активен',
        cancelled: 'Отменен',
        done: 'Завершен',
      }
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const transactionsService = this.$apiClient.service('transactions')
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
      const response = await transactionsService.find({
        query,
      })

      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.transactions = data
      this.total = total

      this.isLoading = false
      return true
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },
  },
}
</script>
