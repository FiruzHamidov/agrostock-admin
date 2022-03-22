<template>
  <div class="app-container">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px">
      <el-row>
        <!-- <h3 style="padding-left: 60px;">Название</h3> -->
        <el-col :span="12">
          <el-form-item :label="'Название'">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <!-- <el-col v-for="lang in languages" :key="lang.id" :span="8">
          <el-form-item :label="`${lang.name} - ${lang.code}`">
            <el-input v-if="form[lang.code]" v-model="form[lang.code].name" />
          </el-form-item>
        </el-col> -->
      </el-row>

      <el-form-item>
        <el-button v-if="isEdit" type="primary" @click="onEdit"> Изменить </el-button>
        <el-button v-if="!isEdit" type="primary" @click="onAdd"> Cохранить </el-button>
        <el-button @click="onCancel">Отмена</el-button>
      </el-form-item>
    </el-form>
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

  props: {
    id: {
      type: Number,
      default: 0,
    },
    categoryId: {
      type: Number,
      required: true,
    },
    languages: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      form: {
        name: '',
      },
      isLoaded: false,
      show: false,
      isEdit: false,
      rules: {
        name: [{ required: true, message: 'Введите название категории', trigger: 'blur' }],
      },
    }
  },

  watch: {
    async id() {
      await this.init()
      this.isLoaded = true
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    async init() {
      if (this.id) {
        this.isEdit = true
        await this.fetchData()
      } else {
        this.isEdit = false
        this.form = { name: '' }
      }

      // for (const lang of this.languages) {
      //   this.form[lang.code] = this.form[lang.code] || {}
      // }

      this.form = { ...this.form }
    },

    async fetchData() {
      const categoryService = this.$apiClient.service('categories')
      const res = await categoryService.get(this.id)

      // for (const lang of this.languages) {
      //   res[lang.code] = res[lang.code] || {}
      // }

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
        await categoryService.patch(this.id, {
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

      this.$emit('on-edit')
    },

    async onAdd() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      const categoryService = this.$apiClient.service('categories')

      const data = { ...this.form, categoryId: this.categoryId, type: 'sub' }
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

      this.$emit('on-add')
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

      this.$emit('on-cancel')
    },
  },
}
</script>

<style>
.line {
  text-align: center;
}
</style>
