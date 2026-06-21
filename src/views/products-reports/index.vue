<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters reports-filters">
        <el-input v-model="filters.search" clearable placeholder="Поиск по описанию" />
        <el-input v-model.number="filters.productId" clearable type="number" placeholder="ID товара" />
        <el-input v-model.number="filters.companyId" clearable type="number" placeholder="ID отправителя" />
        <el-select v-model="filters.type" clearable placeholder="Тип жалобы">
          <el-option label="Общий" value="common" />
          <el-option label="Спам" value="spam" />
        </el-select>
        <el-select v-model="filters.status" clearable placeholder="Статус">
          <el-option label="Новая" value="new" />
          <el-option label="В работе" value="in_review" />
          <el-option label="Рассмотрена" value="resolved" />
          <el-option label="Отклонена" value="rejected" />
        </el-select>
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
      <div class="add-button" />
    </div>
    <el-table
      v-loading="isLoading"
      :data="productsReports"
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
          <template v-if="scope.row.product">
            {{ scope.row.product.name }} - #{{ scope.row.productId }}
            <!-- <router-link
              :to="{ name: 'editTender', params: { id: scope.row.productId } }"
              target="_blank"
            >
            </router-link> -->
          </template>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Отправитель">
        <template slot-scope="scope">
          <template v-if="scope.row.company">
            {{ scope.row.company.organizationName }} - #{{ scope.row.companyId }}
          </template>
          <template v-else>-</template>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Тип" width="120">
        <template slot-scope="scope">
          {{ scope.row.type === 'common' ? 'Общий' : 'Спам' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Описание">
        <template slot-scope="scope">
          {{ scope.row.text }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Общее кол-во жалоб" width="200">
        <template slot-scope="scope">
          {{ scope.row.reportsCount }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Дата" width="180">
        <template slot-scope="scope">
          {{ scope.row.createdAt | toDateFormat }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="Действия" width="200">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'readProductsReport', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
            <router-link
              :to="{ name: 'editProductsReport', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-edit" />
            </router-link>
            <el-button v-if="scope.row.product && scope.row.product.status !== 'banned'" size="small" @click="productBan(scope.row)">
              Заблокировать
            </el-button>
            <el-button v-else size="small">
              Заблокирован
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
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'ProductsReports',

  mixins: [confirmUpdate],

  data() {
    return {
      productsReports: [],
      filters: {
        search: '',
        productId: null,
        companyId: null,
        type: '',
        status: '',
      },
      dateRange: [],
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
      const productsReportsService = this.$apiClient.service('products-reports')

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
        response = await productsReportsService.find({ query })
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить список жалоб на товары')
        this.isLoading = false
        return false
      }

      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.productsReports = data
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
        await this.confirmUpdate('Точно удалить жалобу?', 'Жалоба не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('products-reports').remove(id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить жалобу')
        return false
      }
      this.$message({
        message: 'Жалоба удалена!',
        type: 'success',
      })

      return await this.fetchData()
    },

    async productBan(row) {
      const productId = row.productId
      let reason = ''

      try {
        const result = await this.$prompt('Причина блокировки товара', 'Решение по жалобе', {
          confirmButtonText: 'Заблокировать',
          cancelButtonText: 'Отмена',
          inputPattern: /\S+/,
          inputErrorMessage: 'Укажите причину решения',
        })
        reason = result.value
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Точно заблокировать товар?', 'Товар не заблокирован')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('products').patch(productId, {
          status: 'banned',
          moderationReason: reason,
        })
        await this.$apiClient.service('products-reports').patch(row.id, {
          status: 'resolved',
          resolution: 'product_banned',
          resolutionComment: reason,
        })
      } catch (err) {
        handleApiError(this, err, 'Не удалось применить решение по жалобе')
        return false
      }

      this.$message({
        message: 'Товар заблокирован!',
        type: 'success',
      })

      return await this.fetchData()
    },

    onFilterClick() {
      this.page = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        search: '',
        productId: null,
        companyId: null,
        type: '',
        status: '',
      }
      this.dateRange = []
      this.onFilterClick()
    },
  },
}
</script>

<style scoped>
.reports-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.reports-filters .el-input,
.reports-filters .el-select {
  width: 180px;
}
</style>
