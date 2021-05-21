<template>
  <div class="app-container">
    <el-table v-loading="isLoading" :data="deals" element-loading-text="Loading">
      <el-table-column align="center" label="Номер сделки" width="75">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Информация">
        <template slot-scope="scope">
          {{ scope.row.info }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Сумма сделки">
        <template slot-scope="scope">
          {{ scope.row.price }} {{ currencySymbols[scope.row.currency] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Объем">
        <template slot-scope="scope">
          {{ scope.row.batchSize }} {{ getBatchUnitSizesLabel(scope.row.batchSizeUnit) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Тип сделки" width="300">
        <template slot-scope="scope">
          {{ scope.row.isSafe ? 'Безопасная' : 'Не безопасная' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Дата создания">
        <template slot-scope="scope">
          {{ scope.row.createdAt | toDateFormat }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Статус">
        <template slot-scope="scope">
          {{ statuses[scope.row.status] }} | {{ scope.row.stageStatus }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="Действия" width="200">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'editDeals', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-edit" />
            </router-link>
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

import { currencySymbols, batchUnitSizes } from '@/utils/variables'

export default {
  name: 'Deals',

  filters: {
    toDateFormat: val => {
      if (!moment(val).isValid()) {
        return val
      }
      return moment(val).format('YYYY-MM-DD HH:mm')
    },
  },

  mixins: [confirmUpdate],

  data() {
    return {
      deals: [],
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
      const dealsService = this.$apiClient.service('deals')

      this.isLoading = true
      const query = {
        $limit: this.limit,
        $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
        $sort: {
          createdAt: -1,
        },
      }

      const response = await dealsService.find({
        query,
      })

      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.deals = data
      this.total = total

      this.isLoading = false
      return true
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },

    getBatchUnitSizesLabel(value) {
      return batchUnitSizes.find(item => item.value === value).label
    },
  },
}
</script>
