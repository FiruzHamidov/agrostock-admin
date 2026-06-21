<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters tenders-filters">
        <div class="filter-control filter-control--search">
          <el-input v-model="filters.$search" clearable prefix-icon="el-icon-search" placeholder="Поиск по названию или ID" />
        </div>
        <div class="filter-control">
          <el-select v-model="filters.status" clearable placeholder="Статус">
            <el-option v-for="item in statusesList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="filter-control">
          <el-select v-model="filters.type" clearable placeholder="Тип">
            <el-option label="Продажа" value="sell" />
            <el-option label="Покупка" value="buy" />
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

        <div class="filter-flags">
          <el-checkbox v-model="filters.$getParticipants">С участниками</el-checkbox>
          <el-checkbox v-model="filters.$getMine">Мои торги</el-checkbox>
        </div>

        <div class="filter-actions">
          <el-button @click="resetFilters">Сбросить</el-button>
          <el-button type="primary" @click="onFilterClick">Применить</el-button>
        </div>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addTender' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
      </div>
    </div>
    <el-alert v-if="notAuthenticated" :closable="false" type="error" title="401: требуется авторизация" show-icon />
    <el-alert v-else-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="notFound" :closable="false" type="error" title="404: сервис не найден" show-icon />
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
              :to="{ name: 'readTender', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
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
import { handleApiError } from '@/utils/api-error'
import AsyncSelect from '@/components/AsyncSelect'

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
      tenders: [],
      filters: {
        $search: '',
        status: '',
        type: '',
        companyId: null,
        categoryId: null,
        countryId: null,
        cityId: null,
        $getMine: false,
        $getParticipants: false,
      },
      notAuthenticated: false,
      forbidden: false,
      notFound: false,
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
      statusesList: [
        { value: 'wait', label: 'В ожидании' },
        { value: 'active', label: 'Активен' },
        { value: 'cancelled', label: 'Отменен' },
        { value: 'suspended', label: 'Приостановлен' },
        { value: 'doneWithWinner', label: 'Завершен (есть победитель)' },
        { value: 'doneWithoutWinner', label: 'Завершен (нет победителя)' },
        { value: 'banned', label: 'Заблокирован' },
      ],
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
      const tendersService = this.$apiClient.service('tenders')
      this.isLoading = true
      this.notAuthenticated = false
      this.forbidden = false
      this.notFound = false

      const query = {
        $limit: this.limit,
        $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
        $sort: {
          createdAt: -1,
        },
      }

      if (this.companyId !== -1) {
        query.companyId = this.companyId
      }

      Object.keys(this.filters).forEach(key => {
        if (
          this.filters[key] !== '' &&
          this.filters[key] !== null &&
          this.filters[key] !== undefined &&
          !(typeof this.filters[key] === 'boolean' && this.filters[key] === false)
        ) {
          query[key] = this.filters[key]
        }
      })
      let response
      try {
        response = await tendersService.find({
          query,
        })
      } catch (err) {
        this.notAuthenticated = Number(err && err.code) === 401
        this.forbidden = Number(err && err.code) === 403
        this.notFound = Number(err && err.code) === 404
        handleApiError(this, err, 'Не удалось получить список торгов')
        this.isLoading = false
        return false
      }

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

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить категорию?', 'Категория не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('tenders').remove(id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить торги')
        return false
      }
      this.$message({
        message: 'Торги удалены!',
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
        $search: '',
        status: '',
        type: '',
        companyId: null,
        categoryId: null,
        countryId: null,
        cityId: null,
        $getMine: false,
        $getParticipants: false,
      }
      this.onFilterClick()
    },
  },
}
</script>

<style scoped>
.tenders-filters {
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
.filter-flags,
.filter-actions {
  grid-column: span 2;
  min-width: 0;
}

.filter-control--search {
  grid-column: span 3;
  min-width: 0;
}

.filter-control .el-select,
.filter-control .el-input {
  width: 100%;
}

.filter-control >>> .v-select,
.filter-control >>> .vs__dropdown-toggle {
  width: 100%;
  max-width: 100%;
  min-height: 40px;
}

.filter-control >>> .v-select {
  min-width: 0;
}

.filter-control >>> .vs__selected-options {
  min-width: 0;
}

.filter-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  min-height: 40px;
  color: #606266;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.filter-actions .el-button {
  margin-left: 0;
}

@media (max-width: 1500px) {
  .tenders-filters {
    grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
  }

  .filter-control,
  .filter-flags,
  .filter-actions {
    grid-column: span 2;
  }

  .filter-control--search {
    grid-column: span 4;
  }
}

@media (max-width: 768px) {
  .tenders-filters {
    grid-template-columns: 1fr !important;
  }

  .filter-actions {
    grid-column: span 1;
    justify-content: stretch;
  }

  .filter-control,
  .filter-control--search,
  .filter-flags {
    grid-column: span 1;
  }

  .filter-actions .el-button {
    flex: 1;
  }
}
</style>
