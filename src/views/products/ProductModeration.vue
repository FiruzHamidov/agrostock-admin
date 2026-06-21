<template>
  <div class="app-container">
    <div class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4">
      <div class="filters">
        <el-select v-model="filters.status" clearable placeholder="Статус модерации">
          <el-option label="Ожидает" value="pending" />
          <el-option label="Одобрен" value="approved" />
          <el-option label="Отклонен" value="rejected" />
          <el-option label="Заблокирован" value="banned" />
        </el-select>
        <AsyncSelect
          :value="filters.productId"
          :reduce="getProductId"
          :bind="{ getOptionLabel: getProductLabel }"
          class="w-240"
          clearable
          service="products"
          label="name"
          placeholder="Товар"
          @value-changed="v => (filters.productId = v)"
        />
        <el-input v-model.number="filters.companyId" clearable type="number" placeholder="companyId" class="w-140" />
        <el-button @click="onFilterClick">Применить</el-button>
      </div>
      <div class="add-button">
        <router-link :to="{ name: 'addProductModeration' }">
          <el-button type="success" icon="el-icon-plus" circle />
        </router-link>
      </div>
    </div>
    <el-alert v-if="notAuthenticated" :closable="false" type="error" title="401: требуется авторизация" show-icon />
    <el-alert v-else-if="forbidden" :closable="false" type="error" title="403: доступ запрещен" show-icon />
    <el-alert v-else-if="notFound" :closable="false" type="error" title="404: сервис не найден" show-icon />

    <el-table
      v-loading="isLoading"
      :data="moderationList"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>

      <el-table-column align="center" label="Товар" min-width="240">
        <template slot-scope="scope">
          <template v-if="scope.row.product">
            <router-link :to="{ name: 'editProducts', params: { id: scope.row.productId } }" target="_blank">
              {{ scope.row.product.name }} - #{{ scope.row.productId }}
            </router-link>
          </template>
          <template v-else>#{{ scope.row.productId }}</template>
        </template>
      </el-table-column>

      <el-table-column align="center" label="companyId" width="110">
        <template slot-scope="scope">{{ scope.row.companyId || '-' }}</template>
      </el-table-column>

      <el-table-column align="center" label="moderatorUserId" width="140">
        <template slot-scope="scope">{{ scope.row.moderatorUserId || '-' }}</template>
      </el-table-column>

      <el-table-column align="center" label="Статус" width="130">
        <template slot-scope="scope">{{ getModerationLabel(scope.row.status) }}</template>
      </el-table-column>

      <el-table-column align="center" label="Комментарий" min-width="220">
        <template slot-scope="scope">{{ scope.row.comment || '-' }}</template>
      </el-table-column>

      <el-table-column align="center" label="Дата" width="180">
        <template slot-scope="scope">{{ scope.row.createdAt | toDateFormat }}</template>
      </el-table-column>

      <el-table-column align="center" fixed="right" label="Действия" width="360">
        <template slot-scope="scope">
          <div class="el-button-group">
            <router-link
              :to="{ name: 'readProductModeration', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-document" />
            </router-link>
            <router-link
              :to="{ name: 'editProductModeration', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-edit" />
            </router-link>
            <router-link
              :to="{ name: 'readProducts', params: { id: scope.row.productId } }"
              tag="button"
              class="el-button el-button--default el-button--small"
            >
              <i class="el-icon-view" />
            </router-link>
            <el-button size="small" type="success" @click="moderate(scope.row, 'approved')">Одобрить</el-button>
            <el-button size="small" type="warning" @click="moderate(scope.row, 'rejected')">Отклонить</el-button>
            <el-button size="small" type="danger" @click="moderate(scope.row, 'banned')">Блок</el-button>
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
import { handleApiError } from '@/utils/api-error'
import AsyncSelect from '@/components/AsyncSelect'

export default {
  name: 'ProductModeration',

  components: {
    AsyncSelect,
  },

  mixins: [confirmUpdate],

  data() {
    return {
      moderationList: [],
      notAuthenticated: false,
      forbidden: false,
      notFound: false,
      filters: {
        status: 'pending',
        productId: null,
        companyId: null,
      },
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

      Object.keys(this.filters).forEach(key => {
        if (this.filters[key] !== '' && this.filters[key] !== null && this.filters[key] !== undefined) {
          query[key] = this.filters[key]
        }
      })

      let response
      try {
        response = await this.$apiClient.service('product-moderation').find({ query })
      } catch (err) {
        this.notAuthenticated = Number(err && err.code) === 401
        this.forbidden = Number(err && err.code) === 403
        this.notFound = Number(err && err.code) === 404
        handleApiError(this, err, 'Не удалось получить список модерации товаров')
        this.isLoading = false
        return false
      }

      const { data, total } = response

      if (data.length === 0 && this.page > 1) {
        this.page -= 1
        return await this.fetchData()
      }

      this.moderationList = data
      this.total = total
      this.isLoading = false

      return true
    },

    handleSizeChange(pageSize) {
      this.limit = pageSize
      this.fetchData()
    },

    getModerationLabel(status) {
      const statuses = {
        pending: 'Ожидает',
        approved: 'Одобрен',
        rejected: 'Отклонен',
        banned: 'Заблокирован',
      }

      return statuses[status] || status || '-'
    },

    getProductId(product) {
      if (!product) return null
      return product.id || product.productId
    },

    getProductLabel(product) {
      if (!product || typeof product !== 'object') return product || ''

      const name = product.name || product.title || product.productName
      const id = product.id || product.productId

      return name ? `${name} - #${id}` : `Товар #${id}`
    },

    async moderate(row, status) {
      let comment = row.comment || ''

      try {
        const promptOptions = {
          confirmButtonText: 'Сохранить',
          cancelButtonText: 'Отмена',
          inputValue: comment,
        }
        if (status === 'rejected' || status === 'banned') {
          promptOptions.inputPattern = /\S+/
          promptOptions.inputErrorMessage = 'Для отклонения или блокировки нужен комментарий'
        }
        const result = await this.$prompt('Комментарий модерации', 'Модерация товара', promptOptions)
        comment = result.value
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Применить решение модерации?', 'Действие отменено')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('product-moderation').patch(row.id, {
          status,
          comment,
        })
      } catch (err) {
        handleApiError(this, err, 'Не удалось обновить статус модерации')
        return false
      }

      this.$message({
        message: 'Статус модерации обновлен!',
        type: 'success',
      })

      return await this.fetchData()
    },

    async handleDelete(id) {
      try {
        await this.confirmUpdate('Точно удалить запись модерации?', 'Запись не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('product-moderation').remove(id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить запись модерации')
        return false
      }

      this.$message({
        message: 'Запись модерации удалена!',
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

<style lang="scss" scoped>
.w-120 {
  width: 120px;
}

.w-140 {
  width: 140px;
}

.w-160 {
  width: 160px;
}

.w-240 {
  display: inline-block;
  width: 240px;
  text-align: left;
}
</style>
