<template>
  <div class="category-container">
    <div class="category-container__title">
      <h3>Категория - {{ category.name }}</h3>
    </div>

    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-input v-model="filters.search" placeholder="Название" />
        <el-button @click="onFilterClick"> Применить </el-button>
      </div>
      <div class="add-button">
        <el-button v-if="categoryId" type="success" icon="el-icon-plus" circle @click="onAddClick" />
        <!-- <router-link :to="{ name: 'addSubCategory', params: { id: categoryId } }">
        </router-link> -->
      </div>
    </div>
    <el-table
      v-loading="isLoading"
      :data="categories"
      size="small"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @row-click="onRowClick"
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
      <el-table-column align="center" fixed="right" label="Действия" width="200">
        <template slot-scope="scope">
          <div class="el-button-group">
            <!-- <router-link
              :to="{ name: 'editCategory', params: { id: scope.row.id } }"
              tag="button"
              class="el-button el-button--default el-button--small"
              ><i class="el-icon-edit"
            /></router-link> -->
            <el-button size="small" @click="onEditClick(scope.row.id)">
              <i class="el-icon-edit"
              />
            </el-button>
            <el-button size="small" @click="onDeleteClick(scope.row.id)"
            ><i class="el-icon-delete"
            /></el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="`${formCategoryId ? 'Добавление подкатегории для ' : 'Редактирование подкатегории для '} ${category.name}`" :visible.sync="isShowForm">
      <Form :id="formCategoryId" :category-id="categoryId" :languages="languages" @on-edit="onFormUpdate" @on-add="onFormUpdate" @on-cancel="onFormUpdate" />
    </el-dialog>
  </div>
</template>

<script>
import Form from './form'

export default {
  name: 'Categories',

  components: { Form },

  props: {
    categoryId: {
      type: Number,
      default: 0,
      required: false,
    },
    languages: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      category: {},
      categories: [],
      formCategoryId: null,
      isShowForm: false,
      filters: {},
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
    }
  },

  watch: {
    categoryId() {
      this.fetchData()
    },
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const categoriesService = this.$apiClient.service('categories')

      if (this.categoryId) {
        this.category = await this.$apiClient.service('categories').get(this.categoryId)
      }

      this.isLoading = true
      const query = {
        $limit: -1,
        // $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
        categoryId: this.categoryId,
        type: 'sub',
        $sort: {
          id: -1,
        },
      }
      console.log(query)

      Object.keys(this.filters).forEach(key => {
        if (this.filters[key]) {
          query[key] = this.filters[key]
        }
      })
      const response = await categoriesService.find({
        query,
      })

      // const { data, total } = response

      // if (data.length === 0 && this.page > 1) {
      //   this.page -= 1
      //   return await this.fetchData()
      // }

      this.categories = response
      this.total = response.length

      this.isLoading = false
      return true
    },

    onFilterClick() {
      this.fetchData()
    },

    onAddClick() {
      this.formCategoryId = null
      this.isShowForm = true
    },

    onEditClick(id) {
      this.formCategoryId = id
      this.isShowForm = true
    },

    async onDeleteClick(id) {
      try {
        await this.confirmUpdate('Точно удалить категорию?', 'Категория не удалена')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('categories').remove(id)
      this.$message({
        message: 'Категория удалена!',
        type: 'success',
      })

      return await this.fetchData()
    },

    onRowClick(row) {
      this.$emit('on-select', row.id)
    },

    onFormUpdate() {
      this.isShowForm = false
      this.fetchData()
    },
  },
}
</script>

<style>
.category-container {
  width: 30%;
  margin-right: 3%;
}
</style>
