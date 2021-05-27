<template>
  <div class="app-container">
    <el-table v-loading="isLoading" :data="products" element-loading-text="Loading">
      <el-table-column align="center" label="Номер товара" width="75">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Название">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Объем">
        <template slot-scope="scope">
          {{ scope.row.batchSize }} {{ getBatchUnitSizesLabel(scope.row.batchSizeUnit) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Цена">
        <template slot-scope="scope">
          {{ scope.row.unitPrice }} {{ currencySymbols[scope.row.currency] }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Владелец">
        <template slot-scope="scope">
          {{ scope.row.company.fullName }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="Действия" width="200">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'editProducts', params: { id: scope.row.id } }"
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
import { currencySymbols, batchUnitSizes } from '@/utils/variables'

export default {
  name: 'Products',

  data() {
    return {
      products: [],
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
      currencySymbols,
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const productsService = this.$apiClient.service('products')

      this.isLoading = true
      const query = {
        $limit: this.limit,
        $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
        $sort: {
          createdAt: -1,
        },
      }

      const response = await productsService.find({
        query,
      })

      const { data, total } = response

      console.log(data)

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.products = data
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
