<template>
  <div class="app-container">
    <div class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4">
      <div class="filters">
        <el-input v-model="filters.search" clearable placeholder="Поиск (name/description/id)" class="w-220" />
        <el-select v-model="filters.status" clearable placeholder="Статус" class="m-l-1">
          <el-option label="Ожидает" value="pending" />
          <el-option label="Активен" value="active" />
          <el-option label="Закрыт" value="closed" />
          <el-option label="Заблокирован" value="banned" />
          <el-option label="Отклонен" value="rejected" />
        </el-select>
        <el-select v-model="filters.moderationStatus" clearable placeholder="Модерация" class="m-l-1">
          <el-option label="Ожидает" value="pending" />
          <el-option label="Одобрен" value="approved" />
          <el-option label="Отклонен" value="rejected" />
          <el-option label="Заблокирован" value="banned" />
        </el-select>
        <el-select v-model="filters.type" clearable placeholder="Тип" class="m-l-1">
          <el-option label="Продаю" value="sell" />
          <el-option label="Покупаю" value="buy" />
        </el-select>
        <el-input v-model.number="filters.categoryId" type="number" clearable placeholder="categoryId" class="m-l-1 w-120" />
        <el-input v-model.number="filters.countryId" type="number" clearable placeholder="countryId" class="m-l-1 w-120" />
        <el-input v-model.number="filters.cityId" type="number" clearable placeholder="cityId" class="m-l-1 w-120" />
        <el-date-picker
          v-model="dateRange"
          class="m-l-1"
          type="daterange"
          range-separator="-"
          start-placeholder="dateFrom"
          end-placeholder="dateTo"
          value-format="yyyy-MM-dd"
        />
        <el-select v-model="sortField" placeholder="Сортировка" class="m-l-1 w-160">
          <el-option label="createdAt" value="createdAt" />
          <el-option label="updatedAt" value="updatedAt" />
          <el-option label="unitPrice" value="unitPrice" />
        </el-select>
        <el-select v-model="sortOrder" placeholder="Порядок" class="m-l-1 w-120">
          <el-option :value="-1" label="DESC" />
          <el-option :value="1" label="ASC" />
        </el-select>
        <el-button class="m-l-1" @click="onFilterClick">Применить</el-button>
      </div>
    </div>

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
          {{ (scope.row.company && (scope.row.company.fullName || scope.row.company.organizationName)) || '-' }}
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
            <el-button class="el-button--small" type="danger" @click="removeProduct(scope.row.id)">
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
import { currencySymbols, batchUnitSizes } from '@/utils/variables'
import confirmUpdate from '@/mixins/confirmUpdate'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'Products',
  mixins: [confirmUpdate],

  props: {
    companyId: {
      type: Number,
      default: -1,
    },
  },

  data() {
    return {
      products: [],
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
      currencySymbols,
      filters: {
        search: '',
        status: '',
        moderationStatus: '',
        type: '',
        categoryId: null,
        countryId: null,
        cityId: null,
      },
      dateRange: [],
      sortField: 'createdAt',
      sortOrder: -1,
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
        $sort: {},
      }
      query.$sort[this.sortField] = Number(this.sortOrder)

      Object.keys(this.filters).forEach(key => {
        if (this.filters[key] !== '' && this.filters[key] !== null && this.filters[key] !== undefined) {
          query[key] = this.filters[key]
        }
      })

      if (this.companyId !== -1) {
        query.companyId = this.companyId
      }
      if (this.dateRange && this.dateRange.length === 2) {
        query.dateFrom = this.dateRange[0]
        query.dateTo = this.dateRange[1]
      }

      let response
      try {
        response = await productsService.find({ query })
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить список товаров')
        this.isLoading = false
        return false
      }

      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.products = data
      this.total = total

      this.isLoading = false
      return
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },
    onFilterClick() {
      this.page = 1
      this.fetchData()
    },
    async removeProduct(id) {
      try {
        await this.confirmUpdate('Точно удалить товар?', 'Удаление отменено')
      } catch (err) {
        return false
      }
      try {
        await this.$apiClient.service('products').remove(id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить товар')
        return false
      }
      this.$message({ message: `Товар #${id} удален`, type: 'success' })
      return await this.fetchData()
    },

    getBatchUnitSizesLabel(value) {
      return batchUnitSizes.find(item => item.value === value).label
    },
  },
}
</script>

<style lang="scss" scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.m-l-1 {
  margin-left: 8px;
}

.w-120 {
  width: 120px;
}

.w-160 {
  width: 160px;
}

.w-220 {
  width: 220px;
}
</style>
