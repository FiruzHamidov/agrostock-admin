<template>
  <div class="app-container moderation-form">
    <el-form ref="ruleForm" :model="form" :rules="rules" label-position="top" label-width="160px">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Товар" prop="productId">
            <AsyncSelect
              :value="form.product"
              :reduce="item => item.id"
              clearable
              service="products"
              label="name"
              placeholder="Выберите товар"
              @value-changed="v => (form.productId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="companyId" prop="companyId">
            <el-input v-model.number="form.companyId" type="number" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Статус" prop="status">
            <el-select v-model="form.status" placeholder="Выберите статус">
              <el-option label="Ожидает" value="pending" />
              <el-option label="Одобрен" value="approved" />
              <el-option label="Отклонен" value="rejected" />
              <el-option label="Заблокирован" value="banned" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Комментарий">
        <el-input v-model="form.comment" :autosize="{ minRows: 4, maxRows: 10 }" type="textarea" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">{{ isEdit ? 'Изменить' : 'Создать' }}</el-button>
        <el-button @click="$router.push({ name: 'ProductModeration' })">Отмена</el-button>
        <el-button v-if="isEdit" type="danger" plain @click="onDelete">Удалить</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'ProductModerationForm',

  components: {
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: this.getDefaultForm(),
      rules: {
        productId: [{ required: true, message: 'Выберите товар' }],
        companyId: [{ required: true, message: 'Введите companyId' }],
        status: [{ required: true, message: 'Выберите статус' }],
      },
    }
  },

  computed: {
    isEdit() {
      return Boolean(this.$route.params.id)
    },
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    getDefaultForm() {
      return {
        productId: null,
        product: null,
        companyId: null,
        status: 'pending',
        comment: '',
      }
    },

    async fetchData() {
      if (!this.isEdit) return true

      try {
        const item = await this.$apiClient.service('product-moderation').get(this.$route.params.id)
        this.form = {
          ...this.getDefaultForm(),
          ...item,
          product: item.product || null,
        }
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить запись модерации')
      }
    },

    getPayload() {
      return {
        productId: this.form.productId,
        companyId: this.form.companyId,
        status: this.form.status,
        comment: this.form.comment,
      }
    },

    async onSubmit() {
      try {
        await this.validateForm('ruleForm')
        await this.confirmUpdate(
          this.isEdit ? 'Сохранить запись модерации?' : 'Создать запись модерации?',
          this.isEdit ? 'Запись не изменена' : 'Запись не создана'
        )
      } catch (err) {
        return false
      }

      try {
        if (this.isEdit) {
          await this.$apiClient.service('product-moderation').patch(this.$route.params.id, this.getPayload())
        } else {
          await this.$apiClient.service('product-moderation').create(this.getPayload())
        }
      } catch (err) {
        handleApiError(this, err, this.isEdit ? 'Не удалось обновить запись модерации' : 'Не удалось создать запись модерации')
        return false
      }

      this.$message({ message: this.isEdit ? 'Запись модерации изменена!' : 'Запись модерации создана!', type: 'success' })
      this.$router.push({ name: 'ProductModeration' })
      return true
    },

    async onDelete() {
      try {
        await this.confirmUpdate('Точно удалить запись модерации?', 'Запись не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('product-moderation').remove(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить запись модерации')
        return false
      }

      this.$message({ message: 'Запись модерации удалена!', type: 'success' })
      this.$router.push({ name: 'ProductModeration' })
      return true
    },
  },
}
</script>

<style scoped>
.moderation-form .el-select {
  width: 100%;
}
</style>
