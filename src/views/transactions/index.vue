<template>
  <div class="app-container">
    <div class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4">
      <div class="filters transactions-filters">
        <el-select v-model="filters.type" clearable placeholder="Тип">
          <el-option v-for="(label, value) in types" :key="value" :label="label" :value="value" />
        </el-select>
        <el-select v-model="filters.transactionType" clearable placeholder="Тип транзакции">
          <el-option label="Пополнение" value="replenishment" />
          <el-option label="Списание" value="write-off" />
        </el-select>
        <el-select v-model="filters.status" clearable placeholder="Статус">
          <el-option v-for="(label, value) in statuses" :key="value" :label="label" :value="value" />
        </el-select>
        <el-input v-model.number="filters.userId" clearable type="number" placeholder="userId" />
        <el-input v-model.number="filters.companyId" clearable type="number" placeholder="companyId" />
        <el-input v-model.number="filters.dealId" clearable type="number" placeholder="dealId" />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Дата от"
          end-placeholder="Дата до"
          value-format="yyyy-MM-dd"
        />
        <el-button @click="resetFilters">Сбросить</el-button>
        <el-button type="primary" @click="onFilterClick">Применить</el-button>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addTransaction' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
      </div>
    </div>
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
      <el-table-column align="center" fixed="right" label="Действия" width="160">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'readTransaction', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
            <router-link
              :to="{ name: 'editTransaction', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-edit" />
            </router-link>
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
import moment from 'moment'
import confirmUpdate from '@/mixins/confirmUpdate'
import { handleApiError } from '@/utils/api-error'

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

  mixins: [confirmUpdate],

  data() {
    return {
      transactions: [],
      filters: {
        type: '',
        transactionType: '',
        status: '',
        userId: null,
        companyId: null,
        dealId: null,
      },
      dateRange: [],
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
        error: 'Ошибка',
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
      if (this.dateRange && this.dateRange.length === 2) {
        query.dateFrom = this.dateRange[0]
        query.dateTo = this.dateRange[1]
      }

      let response
      try {
        response = await transactionsService.find({ query })
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить список транзакций')
        this.isLoading = false
        return false
      }

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

    onFilterClick() {
      this.page = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        type: '',
        transactionType: '',
        status: '',
        userId: null,
        companyId: null,
        dealId: null,
      }
      this.dateRange = []
      this.onFilterClick()
    },

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить транзакцию?', 'Транзакция не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('transactions').remove(id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить транзакцию')
        return false
      }

      this.$message({
        message: 'Транзакция удалена!',
        type: 'success',
      })

      return await this.fetchData()
    },
  },
}
</script>

<style scoped>
.transactions-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.transactions-filters .el-input,
.transactions-filters .el-select {
  width: 160px;
}
</style>
