<template>
  <div class="app-container">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px">
      <el-row>
        <el-col :span="8">
          <el-form-item prop="name" label="Название">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item prop="languageId" label="Язык">
            <AsyncSelect
              :value="form.languageId"
              service="languages"
              label="name"
              placeholder="Выберите язык"
              @value-changed="v => (form.languageId = v)"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <Upload :id="form.photoId" @on-change="onPhotoChange" />

      <el-form-item label="Текст">
        <Markdown :input="form.text" @on-update="val => (form.text = val)" />
      </el-form-item>

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
import Markdown from '@/components/Markdown'
import AsyncSelect from '@/components/AsyncSelect'

export default {
  name: 'NewsForm',

  components: {
    Upload,
    Markdown,
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        name: '',
        languageId: null,
        photoId: null,
      },
      isEdit: false,
      rules: {
        name: [{ required: true, message: 'Введите название новости', trigger: 'blur' }],
        description: [{ required: true, message: 'Введите текст новости', trigger: 'blur' }],
        languageId: [{ required: true, message: 'Выберите язык', trigger: 'blur' }],
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
      const newsService = this.$apiClient.service('news')
      const res = await newsService.get(this.$route.params.id)

      this.form = res
    },

    async onEdit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Сохранить изменения новости?', 'Новость не изменена')
      } catch (err) {
        return false
      }

      const newsService = this.$apiClient.service('news')

      try {
        await newsService.patch(this.$route.params.id, {
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
        message: 'Новость изменена!',
        type: 'success',
      })

      this.$router.push({ name: 'News' })
    },

    async onAdd() {
      console.log(this.form)
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      const newsService = this.$apiClient.service('news')

      try {
        await newsService.create({
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
        message: 'Новость сохранена!',
        type: 'success',
      })

      this.$router.push({ name: 'News' })
    },

    async onCancel() {
      try {
        await this.confirmUpdate('Оменить изменения новости?', 'Продолжайте редактирование новости')
      } catch (err) {
        return false
      }

      this.$message({
        message: 'Новость не изменена!',
        type: 'warning',
      })

      this.$router.push({ name: 'News' })
    },

    onPhotoChange(oldId, newId) {
      this.form.photoId = newId
    },
  },
}
</script>

<style>
.line {
  text-align: center;
}
</style>
