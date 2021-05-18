<template>
  <div class="app-container">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px">
      <el-row>
        <h3 style="padding-left: 60px;">Название</h3>
        <el-col v-for="lang in languages" :key="lang.id" :span="8">
          <el-form-item :label="`${lang.name} - ${lang.code}`">
            <el-input v-if="form[lang.code]" v-model="form[lang.code].name" />
          </el-form-item>
        </el-col>
      </el-row>

      <Upload :id="form.photoId" />

      <el-form-item>
        <el-button v-if="isEdit" type="primary" @click="onEdit"> Изменить </el-button>
        <el-button v-if="!isEdit" type="primary" @click="onAdd"> Cохранить </el-button>
        <el-button @click="onCancel">Отмена</el-button>
      </el-form-item>
    </el-form>

    <template v-if="isEdit && form.id">
      <div class="categories-table">
        <Table :category-id="form.id" :languages="languages" @on-select="id => firstCategoryId = id" />
        <Table v-if="firstCategoryId" :category-id="firstCategoryId" :languages="languages" @on-select="id => secondCategoryId = id" />
        <Table v-if="secondCategoryId" :category-id="secondCategoryId" :languages="languages" @on-select="id => thirdCategoryId = id" />
      </div>
    </template>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import Upload from '@/components/Upload'
import Table from './table'

export default {
  name: 'CategoryForm',

  components: {
    Upload,
    Table,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        name: '',
      },
      firstCategoryId: null,
      secondCategoryId: null,
      thirdCategoryId: null,

      categoryId: null,
      formCategoryId: null,
      isShowForm: false,
      show: false,
      isEdit: false,
      rules: {
        // name: [{ required: true, message: 'Введите название категории', trigger: 'blur' }],
      },

      languages: [],
    }
  },

  watch: {
    $route: {
      handler() {
        this.init()
      },
      deep: true,
    },
  },

  mounted() {
    this.fetchLanguages()

    this.init()
  },

  methods: {
    async init() {
      if (this.$route.params.id) {
        this.isEdit = true
        await this.fetchData()
      } else {
        this.isEdit = false
        this.form = { name: '' }
      }

      for (const lang of this.languages) {
        this.form[lang.code] = this.form[lang.code] || {}
      }
    },

    async fetchLanguages() {
      this.languages = await this.$apiClient.service('languages').find({
        query: {
          $limit: -1,
        },
      })
    },

    async fetchData() {
      const categoryService = this.$apiClient.service('categories')
      const res = await categoryService.get(this.$route.params.id, { query: { $getAllLang: true } })

      this.form = res
    },

    async onEdit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Сохранить изменения категории?', 'Категория не изменена')
      } catch (err) {
        return false
      }

      const categoryService = this.$apiClient.service('categories')

      try {
        await categoryService.patch(this.$route.params.id, {
          ...this.form,
        })
      } catch (err) {
        this.$message({
          message: err.message,
          type: 'error',
        })
        return false
      }

      this.$message({
        message: 'Категория изменена!',
        type: 'success',
      })

      this.$router.push({ name: 'Categories' })
    },

    async onAdd() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      const categoryService = this.$apiClient.service('categories')

      const data = { ...this.form }
      if (this.$route.name === 'addSubCategory') {
        data.categoryId = this.$route.params.id
        data.type = 'sub'
      } else {
        data.type = 'main'
      }
      try {
        await categoryService.create({
          ...data,
        })
      } catch (err) {
        this.$message({
          message: err.message,
          type: 'error',
        })
        return false
      }

      this.$message({
        message: 'Категория сохранена!',
        type: 'success',
      })

      this.$router.push({ name: 'Categories' })
    },

    async onCancel() {
      try {
        await this.confirmUpdate(
          'Оменить изменения категории?',
          'Продолжайте редактирование категории'
        )
      } catch (err) {
        return false
      }

      this.$message({
        message: 'Категория не изменена!',
        type: 'warning',
      })

      this.$router.push({ name: 'Categories' })
    },

    onAddCategory(categoryId) {
      this.categoryId = categoryId
      this.formCategoryId = null
      this.isShowForm = true
    },

    onEditCategory(formCategoryId, categoryId) {
      this.categoryId = categoryId
      this.formCategoryId = formCategoryId
      this.isShowForm = true
    },
  },
}
</script>

<style>
.line {
  text-align: center;
}
.categories-table {
  display: flex;
  flex-direction: row;
}
</style>
