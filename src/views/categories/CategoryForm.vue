<template>
  <div class="app-container">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px">
      <el-row>
        <el-col :span="8">
          <el-form-item prop="name" label="Название">
            <el-input v-model="form.name" />
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
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import Upload from '@/components/Upload'

export default {
  name: 'CategoryForm',

  components: {
    Upload,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        name: '',
      },
      show: false,
      isEdit: false,
      rules: {
        name: [{ required: true, message: 'Введите название категории', trigger: 'blur' }],
      },
    }
  },

  mounted() {
    if (this.$route.params.id) {
      this.isEdit = true
      this.fetchData()
    }
  },

  methods: {
    async fetchData() {
      const categoryService = this.$apiClient.service('categories')
      const res = await categoryService.get(this.$route.params.id)

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

      try {
        await categoryService.create({
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
  },
}
</script>

<style>
.line {
  text-align: center;
}
</style>
