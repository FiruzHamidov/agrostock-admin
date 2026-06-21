<template>
  <div class="app-container">
    <div class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4">
      <div class="filters products-filters">
        <div class="filter-control filter-control--search">
          <el-input v-model="filters.search" clearable prefix-icon="el-icon-search" placeholder="Поиск по названию или ID" />
        </div>
        <div class="filter-control">
          <el-select v-model="filters.status" clearable placeholder="Статус">
            <el-option label="Ожидает" value="pending" />
            <el-option label="Активен" value="active" />
            <el-option label="Закрыт" value="closed" />
            <el-option label="Заблокирован" value="banned" />
            <el-option label="Отклонен" value="rejected" />
          </el-select>
        </div>
        <div class="filter-control">
          <el-select v-model="filters.moderationStatus" clearable placeholder="Модерация">
            <el-option label="Ожидает" value="pending" />
            <el-option label="Одобрен" value="approved" />
            <el-option label="Отклонен" value="rejected" />
            <el-option label="Заблокирован" value="banned" />
          </el-select>
        </div>
        <div class="filter-control">
          <el-select v-model="filters.type" clearable placeholder="Тип">
            <el-option label="Продаю" value="sell" />
            <el-option label="Покупаю" value="buy" />
          </el-select>
        </div>
        <div class="filter-control">
          <AsyncSelect
            :value="filters.companyId"
            :reduce="getCompanyId"
            :query-limit="100"
            :remote-search="false"
            :bind="{ getOptionLabel: getCompanyLabel }"
            clearable
            service="companies"
            label="organizationName"
            placeholder="Компания"
            @value-changed="v => (filters.companyId = v)"
          />
        </div>
        <div class="filter-control">
          <AsyncSelect
            :value="filters.categoryId"
            :reduce="getCategoryId"
            clearable
            service="categories"
            label="name"
            placeholder="Категория"
            @value-changed="v => (filters.categoryId = v)"
          />
        </div>
        <div class="filter-control">
          <AsyncSelect
            :value="filters.countryId"
            :reduce="getCountryId"
            clearable
            service="countries"
            label="name"
            placeholder="Страна"
            @value-changed="onCountryFilterChange"
          />
        </div>
        <div class="filter-control">
          <AsyncSelect
            :value="filters.cityId"
            :reduce="getCityId"
            :additional-query="cityFilterQuery"
            :query-limit="50"
            clearable
            service="cities"
            label="name"
            placeholder="Город"
            @value-changed="v => (filters.cityId = v)"
          />
        </div>
        <el-date-picker
          v-model="dateRange"
          class="filter-date"
          type="daterange"
          range-separator="-"
          start-placeholder="Дата от"
          end-placeholder="Дата до"
          value-format="yyyy-MM-dd"
        />
        <div class="filter-control">
          <el-select v-model="sortField" placeholder="Сортировка">
            <el-option label="Создан" value="createdAt" />
            <el-option label="Обновлен" value="updatedAt" />
            <el-option label="Цена" value="unitPrice" />
          </el-select>
        </div>
        <div class="filter-control">
          <el-select v-model="sortOrder" placeholder="Порядок">
            <el-option :value="-1" label="По убыванию" />
            <el-option :value="1" label="По возрастанию" />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button @click="resetFilters">Сбросить</el-button>
          <el-button type="primary" @click="onFilterClick">Применить</el-button>
        </div>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addProducts' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
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
              :to="{ name: 'readProducts', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
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
import AsyncSelect from '@/components/AsyncSelect'

export default {
  name: 'Products',

  components: {
    AsyncSelect,
  },

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
        companyId: null,
        categoryId: null,
        countryId: null,
        cityId: null,
      },
      dateRange: [],
      sortField: 'createdAt',
      sortOrder: -1,
    }
  },

  computed: {
    cityFilterQuery() {
      return this.filters.countryId ? { country_id: this.filters.countryId } : {}
    },
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

    resetFilters() {
      this.filters = {
        search: '',
        status: '',
        moderationStatus: '',
        type: '',
        companyId: null,
        categoryId: null,
        countryId: null,
        cityId: null,
      }
      this.dateRange = []
      this.sortField = 'createdAt'
      this.sortOrder = -1
      this.onFilterClick()
    },

    getCompanyId(company) {
      if (!company) return null
      return company.id || company.companyId
    },

    getCompanyLabel(company) {
      if (!company || typeof company !== 'object') return company || ''

      const name =
        company.organizationName ||
        company.fullName ||
        company.username ||
        company.email ||
        company.phone

      return name ? `${name} #${company.id}` : `Компания #${company.id}`
    },

    getCategoryId(category) {
      if (!category) return null
      return category.id || category.categoryId
    },

    getCountryId(country) {
      if (!country) return null
      return country.id || country.countryId || country.country_id
    },

    getCityId(city) {
      if (!city) return null
      return city.id || city.cityId || city.city_id
    },

    onCountryFilterChange(countryId) {
      this.filters.countryId = countryId
      this.filters.cityId = null
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
.products-filters {
  display: grid !important;
  grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
  gap: 12px !important;
  align-items: center !important;
  padding: 16px !important;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(30, 42, 70, 0.04);
  text-align: left;
}

.filter-control,
.filter-actions {
  grid-column: span 2;
  min-width: 0;
}

.filter-control--search,
.filter-date {
  grid-column: span 3;
  min-width: 0;
}

.filter-control .el-select,
.filter-control .el-input,
.filter-date {
  width: 100%;
}

.filter-control /deep/ .v-select,
.filter-control /deep/ .vs__dropdown-toggle {
  width: 100%;
  max-width: 100%;
  min-height: 40px;
}

.filter-control /deep/ .v-select,
.filter-control /deep/ .vs__selected-options {
  min-width: 0;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.filter-actions .el-button {
  margin-left: 0;
}

@media (max-width: 1500px) {
  .products-filters {
    grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
  }

  .filter-control,
  .filter-actions {
    grid-column: span 2;
  }

  .filter-actions {
    grid-column: 1 / -1;
  }

  .filter-control--search,
  .filter-date {
    grid-column: span 4;
  }
}

@media (max-width: 768px) {
  .products-filters {
    grid-template-columns: 1fr !important;
  }

  .filter-control,
  .filter-control--search,
  .filter-date,
  .filter-actions {
    grid-column: span 1;
  }

  .filter-actions {
    justify-content: stretch;
  }

  .filter-actions .el-button {
    flex: 1;
  }
}
</style>
