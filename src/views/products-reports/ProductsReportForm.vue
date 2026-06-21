<template>
  <div class="app-container report-form">
    <el-form ref="ruleForm" :model="form" :rules="rules" label-position="top" label-width="160px">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Тип" prop="reason">
            <el-select v-model="form.reason" placeholder="Выберите тип">
              <el-option label="Общий" value="common" />
              <el-option label="Спам" value="spam" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Общее кол-во жалоб">
            <el-input v-model.number="form.reportsCount" type="number" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Товар">
            <strong class="readonly-value">{{ getProductLabel(form.product, form.productId) }}</strong>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Описание" prop="text">
        <el-input v-model="form.text" :autosize="{ minRows: 6, maxRows: 12 }" type="textarea" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">Изменить</el-button>
        <el-button @click="$router.push({ name: 'ProductsReports' })">Отмена</el-button>
        <el-button type="danger" plain @click="onDelete">Удалить</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'ProductsReportForm',

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        reason: 'common',
        type: 'common',
        text: '',
        reportsCount: 0,
        productId: null,
        product: null,
      },
      rules: {
        reason: [{ required: true, message: 'Выберите тип' }],
        text: [{ required: true, message: 'Введите описание' }],
      },
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        const report = await this.$apiClient.service('products-reports').get(this.$route.params.id)
        this.form = {
          ...this.form,
          ...report,
          reason: report.reason || report.type || 'common',
          type: report.type || report.reason || 'common',
        }
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить жалобу')
      }
    },

    getProductLabel(product, fallbackId) {
      if (!product) return fallbackId || '-'
      return `${product.name || 'Товар'} #${product.id || fallbackId || ''}`
    },

    getPayload() {
      return {
        reason: this.form.reason,
        type: this.form.reason,
        text: this.form.text,
        reportsCount: this.form.reportsCount,
      }
    },

    async onSubmit() {
      try {
        await this.validateForm('ruleForm')
        await this.confirmUpdate('Сохранить изменения жалобы?', 'Жалоба не изменена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('products-reports').patch(this.$route.params.id, this.getPayload())
      } catch (err) {
        handleApiError(this, err, 'Не удалось обновить жалобу')
        return false
      }

      this.$message({ message: 'Жалоба изменена!', type: 'success' })
      this.$router.push({ name: 'ProductsReports' })
      return true
    },

    async onDelete() {
      try {
        await this.confirmUpdate('Точно удалить жалобу?', 'Жалоба не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('products-reports').remove(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить жалобу')
        return false
      }

      this.$message({ message: 'Жалоба удалена!', type: 'success' })
      this.$router.push({ name: 'ProductsReports' })
      return true
    },
  },
}
</script>

<style scoped>
.report-form .el-select {
  width: 100%;
}

.readonly-value {
  display: block;
  min-height: 40px;
  padding-top: 10px;
  color: #303133;
}
</style>
