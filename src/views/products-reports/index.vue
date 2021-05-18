<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters" />
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
            <el-button v-if="scope.row.tender && scope.row.tender.status !== 'banned'" size="small" @click="productBan(scope.row.productId)">
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

export default {
  name: 'ProductsReports',

  mixins: [confirmUpdate],

  data() {
    return {
      productsReports: [],
      filters: {},
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
      const response = await productsReportsService.find({
        query,
      })

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

      await this.$apiClient.service('products-reports').remove(id)
      this.$message({
        message: 'Жалоба удалена!',
        type: 'success',
      })

      return await this.fetchData()
    },

    async productBan(productId) {
      try {
        await this.confirmUpdate('Точно заблокировать товар?', 'Товар не заблокирован')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('products').patch(productId, { status: 'banned' })
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
  },
}
</script>
