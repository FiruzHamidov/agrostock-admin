<template>
  <div class="app-container transaction-form">
    <el-form ref="ruleForm" :model="form" :rules="rules" label-position="top" label-width="160px">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Компания" prop="companyId">
            <AsyncSelect
              :value="form.company"
              :reduce="getCompanyId"
              :query-limit="100"
              :remote-search="false"
              :bind="{ getOptionLabel: getCompanyLabel }"
              clearable
              service="companies"
              label="organizationName"
              placeholder="Выберите компанию"
              @value-changed="onCompanyChange"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Сумма" prop="sum">
            <el-input v-model="form.sum" type="number" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Дата" prop="date">
            <el-date-picker v-model="form.date" type="datetime" placeholder="Выберите дату" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Тип" prop="type">
            <el-select v-model="form.type" placeholder="Выберите тип">
              <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Тип транзакции" prop="transactionType">
            <el-select v-model="form.transactionType" placeholder="Выберите тип транзакции">
              <el-option label="Пополнение" value="replenishment" />
              <el-option label="Списание" value="write-off" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Статус" prop="status">
            <el-select v-model="form.status" placeholder="Выберите статус">
              <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Товар">
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
          <el-form-item label="Торги">
            <AsyncSelect
              :value="form.tender"
              :reduce="item => item.id"
              clearable
              service="tenders"
              label="name"
              placeholder="Выберите торги"
              @value-changed="v => (form.tenderId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Сделка">
            <AsyncSelect
              :value="form.deal"
              :reduce="item => item.id"
              :bind="{ getOptionLabel: getDealLabel }"
              clearable
              service="deals"
              label="id"
              placeholder="Выберите сделку"
              @value-changed="v => (form.dealId = v)"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-form-item>
          <el-checkbox v-model="form.isFreezed">Заморожено</el-checkbox>
        </el-form-item>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">{{ isEdit ? 'Изменить' : 'Создать' }}</el-button>
        <el-button @click="onCancel">Отмена</el-button>
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
  name: 'TransactionForm',

  components: {
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: this.getDefaultForm(),
      rules: {
        companyId: [{ required: true, message: 'Выберите компанию' }],
        sum: [{ required: true, message: 'Введите сумму' }],
        type: [{ required: true, message: 'Выберите тип' }],
        transactionType: [{ required: true, message: 'Выберите тип транзакции' }],
        status: [{ required: true, message: 'Выберите статус' }],
      },
      types: [
        { value: 'user', label: 'Пользователь' },
        { value: 'product', label: 'Товар' },
        { value: 'commission', label: 'Комиссия' },
        { value: 'deal', label: 'Сделка' },
        { value: 'tender', label: 'Тендер' },
        { value: 'tender-commission', label: 'Тендерная комиссия' },
      ],
      statuses: [
        { value: 'wait', label: 'В ожидании' },
        { value: 'done', label: 'Завершен' },
        { value: 'error', label: 'Ошибка' },
        { value: 'cancelled', label: 'Отменен' },
      ],
    }
  },

  computed: {
    isEdit() {
      return Boolean(this.$route.params.id)
    },
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
    this.init()
  },

  methods: {
    getDefaultForm() {
      return {
        companyId: null,
        company: null,
        sum: '',
        date: '',
        type: 'user',
        transactionType: 'replenishment',
        status: 'wait',
        isFreezed: false,
        productId: null,
        product: null,
        tenderId: null,
        tender: null,
        dealId: null,
        deal: null,
      }
    },

    async init() {
      if (!this.isEdit) {
        this.form = this.getDefaultForm()
        return true
      }

      try {
        const transaction = await this.$apiClient.service('transactions').get(this.$route.params.id)
        this.form = {
          ...this.getDefaultForm(),
          ...transaction,
          company: transaction.company || null,
          product: transaction.product || null,
          tender: transaction.tender || null,
          deal: transaction.deal || null,
        }
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить транзакцию')
      }
    },

    onCompanyChange(companyId) {
      this.form.companyId = companyId
      this.form.company = null
    },

    getCompanyId(company) {
      if (!company) return null
      return company.id || company.companyId
    },

    getCompanyLabel(company) {
      if (!company || typeof company !== 'object') return company || ''
      const name = company.organizationName || company.fullName || company.username || company.email || company.phone
      return name ? `${name} #${company.id}` : `Компания #${company.id}`
    },

    getDealLabel(deal) {
      if (!deal || typeof deal !== 'object') return deal || ''
      return `Сделка #${deal.id}`
    },

    getPayload() {
      const fields = [
        'companyId',
        'sum',
        'date',
        'type',
        'transactionType',
        'status',
        'isFreezed',
        'productId',
        'tenderId',
        'dealId',
      ]

      return fields.reduce((payload, field) => {
        payload[field] = this.form[field]
        return payload
      }, {})
    },

    async onSubmit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate(
          this.isEdit ? 'Сохранить изменения транзакции?' : 'Создать транзакцию?',
          this.isEdit ? 'Транзакция не изменена' : 'Транзакция не создана'
        )
      } catch (err) {
        return false
      }

      const transactionsService = this.$apiClient.service('transactions')

      try {
        if (this.isEdit) {
          await transactionsService.patch(this.$route.params.id, this.getPayload())
        } else {
          await transactionsService.create(this.getPayload())
        }
      } catch (err) {
        handleApiError(this, err, this.isEdit ? 'Не удалось обновить транзакцию' : 'Не удалось создать транзакцию')
        return false
      }

      this.$message({
        message: this.isEdit ? 'Транзакция изменена!' : 'Транзакция создана!',
        type: 'success',
      })

      this.$router.push({ name: 'Transactions' })
      return true
    },

    async onCancel() {
      this.$router.push({ name: 'Transactions' })
    },

    async onDelete() {
      try {
        await this.confirmUpdate('Точно удалить транзакцию?', 'Транзакция не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('transactions').remove(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить транзакцию')
        return false
      }

      this.$message({
        message: 'Транзакция удалена!',
        type: 'success',
      })

      this.$router.push({ name: 'Transactions' })
      return true
    },
  },
}
</script>

<style scoped>
.transaction-form .el-select,
.transaction-form .el-date-editor {
  width: 100%;
}
</style>
