<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-input v-model="filters.$search" clearable placeholder="Поиск" />
        <el-select v-model="filters.status" clearable placeholder="Статус">
          <el-option v-for="item in statusesList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.type" clearable placeholder="Тип">
          <el-option label="Продажа" value="sell" />
          <el-option label="Покупка" value="buy" />
        </el-select>
        <el-input v-model.number="filters.companyId" clearable type="number" placeholder="companyId" class="w-140" />
        <el-input
          v-model.number="filters.categoryId"
          clearable
          type="number"
          placeholder="categoryId"
          class="w-140"
        />
        <el-input v-model.number="filters.countryId" clearable type="number" placeholder="countryId" class="w-140" />
        <el-input v-model.number="filters.cityId" clearable type="number" placeholder="cityId" class="w-120" />
        <el-switch v-model="filters.$getMine" active-text="$getMine" />
        <el-switch v-model="filters.$getParticipants" active-text="$getParticipants" />
        <el-button @click="onFilterClick"> Применить </el-button>
      </div>
      <div class="add-button" />
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
      filters: {},
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
      },
      statusesList: [
        { value: 'wait', label: 'В ожидании' },
        { value: 'active', label: 'Активен' },
        { value: 'cancelled', label: 'Отменен' },
        { value: 'suspended', label: 'Приостановлен' },
        { value: 'doneWithWinner', label: 'Завершен (есть победитель)' },
        { value: 'doneWithoutWinner', label: 'Завершен (нет победителя)' },
      ],
    }
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
  },
}
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.w-120 {
  width: 120px;
}

.w-140 {
  width: 140px;
}
</style>
