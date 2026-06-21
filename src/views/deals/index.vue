<template>
  <div class="app-container">
    <div class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4">
      <div class="filters deals-filters">
        <div class="filter-control">
          <el-input v-model.number="filters.id" clearable type="number" placeholder="ID сделки" />
        </div>
        <div class="filter-control">
          <el-select v-model="filters.status" clearable placeholder="Статус">
            <el-option v-for="item in statusesList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="filter-control">
          <el-select v-model="filters.stageStatus" clearable placeholder="Этап">
            <el-option v-for="item in stageStatusesList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="filter-control">
          <el-select v-model="filters.isSafe" clearable placeholder="Тип сделки">
            <el-option :value="true" label="Безопасная" />
            <el-option :value="false" label="Не безопасная" />
          </el-select>
        </div>
        <div class="filter-control filter-control--company">
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
        <el-date-picker
          v-model="dateRange"
          class="filter-date"
          type="daterange"
          range-separator="-"
          start-placeholder="Дата от"
          end-placeholder="Дата до"
          value-format="yyyy-MM-dd"
        />
        <div class="filter-actions">
          <el-button @click="resetFilters">Сбросить</el-button>
          <el-button type="primary" @click="onFilterClick">Применить</el-button>
        </div>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addDeals' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
      </div>
    </div>
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
      <el-table-column align="center" fixed="right" label="Действия" width="240">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'readDeals', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
            <router-link
              :to="{ name: 'editDeals', params: { id: scope.row.id } }"
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

import { currencySymbols, batchUnitSizes } from '@/utils/variables'
import { handleApiError } from '@/utils/api-error'
import AsyncSelect from '@/components/AsyncSelect'
import confirmUpdate from '@/mixins/confirmUpdate'

export default {
  name: 'Deals',

  components: {
    AsyncSelect,
  },

  filters: {
    toDateFormat: val => {
      if (!moment(val).isValid()) {
        return val
      }
      return moment(val).format('YYYY-MM-DD HH:mm')
    },
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
      deals: [],
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
      filters: {
        id: null,
        status: '',
        stageStatus: '',
        isSafe: '',
        companyId: null,
      },
      dateRange: [],
      currencySymbols,
      statuses: {
        active: 'Активен',
        cancelled: 'Отменен',
        done: 'Завершен',
        arbitration: 'Арбитраж',
      },
      statusesList: [
        { value: 'active', label: 'Активен' },
        { value: 'cancelled', label: 'Отменен' },
        { value: 'done', label: 'Завершен' },
      ],
      stageStatusesList: [
        { value: 'reserveFunds', label: 'Резервирование' },
        { value: 'sendProduct', label: 'Отправка товара' },
        { value: 'done', label: 'Закрытие сделки' },
      ],
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

      if (this.companyId !== -1) {
        query.companyId = this.companyId
      }

      Object.keys(this.filters).forEach(key => {
        if (
          this.filters[key] !== '' &&
          this.filters[key] !== null &&
          this.filters[key] !== undefined
        ) {
          query[key] = this.filters[key]
        }
      })

      if (!query.status) {
        query.status = {
          $ne: 'arbitration',
        }
      }

      if (this.dateRange && this.dateRange.length === 2) {
        query.createdAt = {
          $gte: this.dateRange[0],
          $lte: moment(this.dateRange[1]).endOf('day').toISOString(),
        }
      }

      let response
      try {
        response = await dealsService.find({
          query,
        })
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить список сделок')
        this.isLoading = false
        return false
      }

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

    onFilterClick() {
      this.page = 1
      this.fetchData()
    },

    resetFilters() {
      this.filters = {
        id: null,
        status: '',
        stageStatus: '',
        isSafe: '',
        companyId: null,
      }
      this.dateRange = []
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

    getBatchUnitSizesLabel(value) {
      const unit = batchUnitSizes.find(item => item.value === value)
      return unit ? unit.label : value || ''
    },

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить сделку?', 'Сделка не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('deals').remove(id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить сделку')
        return false
      }

      this.$message({
        message: 'Сделка удалена!',
        type: 'success',
      })

      return await this.fetchData()
    },
  },
}
</script>

<style scoped>
.deals-filters {
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

.filter-control--company,
.filter-date {
  grid-column: span 3;
  min-width: 0;
}

.filter-control .el-select,
.filter-control .el-input,
.filter-date {
  width: 100%;
}

.filter-control >>> .v-select,
.filter-control >>> .vs__dropdown-toggle {
  width: 100%;
  max-width: 100%;
  min-height: 40px;
}

.filter-control >>> .v-select,
.filter-control >>> .vs__selected-options {
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
  .deals-filters {
    grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
  }

  .filter-control,
  .filter-actions {
    grid-column: span 2;
  }

  .filter-control--company,
  .filter-date {
    grid-column: span 4;
  }

  .filter-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .deals-filters {
    grid-template-columns: 1fr !important;
  }

  .filter-control,
  .filter-control--company,
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
