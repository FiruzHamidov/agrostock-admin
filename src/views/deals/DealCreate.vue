<template>
  <div class="app-container deal-create">
    <el-form ref="ruleForm" :model="form" :rules="rules" label-position="top" label-width="160px">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Продавец" prop="sellerId">
            <AsyncSelect
              :value="form.seller"
              :reduce="getCompanyId"
              :query-limit="100"
              :remote-search="false"
              :bind="{ getOptionLabel: getCompanyLabel }"
              clearable
              service="companies"
              label="organizationName"
              placeholder="Выберите продавца"
              @value-changed="onSellerChange"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Покупатель" prop="buyerId">
            <AsyncSelect
              :value="form.buyer"
              :reduce="getCompanyId"
              :query-limit="100"
              :remote-search="false"
              :bind="{ getOptionLabel: getCompanyLabel }"
              clearable
              service="companies"
              label="organizationName"
              placeholder="Выберите покупателя"
              @value-changed="onBuyerChange"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Тип" prop="type">
            <el-select v-model="form.type" placeholder="Выберите тип">
              <el-option label="Товар" value="product" />
              <el-option label="Торги" value="tender" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col v-if="form.type === 'product'" :xs="24" :sm="12" :md="8">
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
        <el-col v-if="form.type === 'tender'" :xs="24" :sm="12" :md="8">
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
          <el-form-item label="Цена" prop="price">
            <el-input v-model="form.price" type="number" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Валюта" prop="currency">
            <el-select v-model="form.currency" placeholder="Выберите валюту">
              <el-option v-for="item in currencies" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Объем" prop="batchSize">
            <el-input v-model="form.batchSize" type="number" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Единица" prop="batchSizeUnit">
            <el-select v-model="form.batchSizeUnit" placeholder="Выберите единицу">
              <el-option v-for="item in batchUnitSizes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Безопасная сделка">
            <el-switch v-model="form.isSafe" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Статус" prop="status">
            <el-select v-model="form.status" placeholder="Выберите статус">
              <el-option label="Активен" value="active" />
              <el-option label="Завершен" value="done" />
              <el-option label="Отменен" value="cancelled" />
              <el-option label="Арбитраж" value="arbitration" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Этап" prop="stageStatus">
            <el-select v-model="form.stageStatus" placeholder="Выберите этап">
              <el-option label="Резервирование" value="reserveFunds" />
              <el-option label="Отправка товара" value="sendProduct" />
              <el-option label="Закрытие сделки" value="done" />
              <el-option label="Товар отправлен" value="productSended" />
              <el-option label="Закрытие" value="closing" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Дней на контракт">
            <el-input v-model="form.daysForContract" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Страна отправки">
            <AsyncSelect
              :value="form.countrySend"
              :reduce="getCountryId"
              clearable
              service="countries"
              label="name"
              placeholder="Выберите страну"
              @value-changed="onCountrySendChange"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Город отправки">
            <AsyncSelect
              :value="form.citySend"
              :reduce="getCityId"
              :additional-query="countrySendQuery"
              :query-limit="50"
              clearable
              service="cities"
              label="name"
              placeholder="Выберите город"
              @value-changed="v => (form.citySendId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Адрес отправки">
            <el-input v-model="form.addressSend" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Страна получения">
            <AsyncSelect
              :value="form.countryRecipient"
              :reduce="getCountryId"
              clearable
              service="countries"
              label="name"
              placeholder="Выберите страну"
              @value-changed="onCountryRecipientChange"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Город получения">
            <AsyncSelect
              :value="form.cityRecipient"
              :reduce="getCityId"
              :additional-query="countryRecipientQuery"
              :query-limit="50"
              clearable
              service="cities"
              label="name"
              placeholder="Выберите город"
              @value-changed="v => (form.cityRecipientId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Адрес получения">
            <el-input v-model="form.addressRecipient" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Доставка">
            <el-select v-model="form.delivery" clearable placeholder="Выберите доставку">
              <el-option label="Самовывоз" value="pickup" />
              <el-option label="Доставка" value="delivery" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Цена доставки">
            <el-input v-model="form.deliveryPrice" type="number" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-form-item label="Доставка включена в цену">
            <el-switch v-model="form.isDeliveryIncludesInPrice" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="onCreate">Создать</el-button>
        <el-button @click="$router.push({ name: 'Deals' })">Отмена</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'
import { batchUnitSizes, currencies } from '@/utils/variables'
import { handleApiError } from '@/utils/api-error'

export default {
  name: 'DealCreate',

  components: {
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: this.getDefaultForm(),
      batchUnitSizes,
      currencies,
      rules: {
        sellerId: [{ required: true, message: 'Выберите продавца' }],
        buyerId: [{ required: true, message: 'Выберите покупателя' }],
        type: [{ required: true, message: 'Выберите тип' }],
        price: [{ required: true, message: 'Введите цену' }],
        currency: [{ required: true, message: 'Выберите валюту' }],
        batchSize: [{ required: true, message: 'Введите объем' }],
        batchSizeUnit: [{ required: true, message: 'Выберите единицу' }],
        status: [{ required: true, message: 'Выберите статус' }],
        stageStatus: [{ required: true, message: 'Выберите этап' }],
      },
    }
  },

  computed: {
    countrySendQuery() {
      return this.form.countrySendId ? { country_id: this.form.countrySendId } : {}
    },

    countryRecipientQuery() {
      return this.form.countryRecipientId ? { country_id: this.form.countryRecipientId } : {}
    },
  },

  methods: {
    getDefaultForm() {
      return {
        sellerId: null,
        seller: null,
        buyerId: null,
        buyer: null,
        productId: null,
        product: null,
        tenderId: null,
        tender: null,
        countrySendId: null,
        countrySend: null,
        citySendId: null,
        citySend: null,
        countryRecipientId: null,
        countryRecipient: null,
        cityRecipientId: null,
        cityRecipient: null,
        type: 'product',
        price: '',
        currency: 'rub',
        batchSize: '',
        batchSizeUnit: 't',
        delivery: '',
        isDeliveryIncludesInPrice: false,
        deliveryPrice: '',
        addressSend: '',
        addressRecipient: '',
        isSafe: false,
        status: 'active',
        stageStatus: 'reserveFunds',
        daysForContract: '',
      }
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

    getCountryId(country) {
      if (!country) return null
      return country.country_id || country.countryId || country.id
    },

    getCityId(city) {
      if (!city) return null
      return city.city_id || city.cityId || city.id
    },

    onSellerChange(companyId) {
      this.form.sellerId = companyId
      this.form.seller = null
    },

    onBuyerChange(companyId) {
      this.form.buyerId = companyId
      this.form.buyer = null
    },

    onCountrySendChange(countryId) {
      this.form.countrySendId = countryId
      this.form.citySendId = null
      this.form.citySend = null
    },

    onCountryRecipientChange(countryId) {
      this.form.countryRecipientId = countryId
      this.form.cityRecipientId = null
      this.form.cityRecipient = null
    },

    getPayload() {
      const fields = [
        'sellerId',
        'buyerId',
        'productId',
        'tenderId',
        'countrySendId',
        'citySendId',
        'countryRecipientId',
        'cityRecipientId',
        'type',
        'price',
        'currency',
        'batchSize',
        'batchSizeUnit',
        'delivery',
        'isDeliveryIncludesInPrice',
        'deliveryPrice',
        'addressSend',
        'addressRecipient',
        'isSafe',
        'status',
        'stageStatus',
        'daysForContract',
      ]

      const payload = fields.reduce((data, field) => {
        data[field] = this.form[field]
        return data
      }, {})

      if (payload.type === 'product') {
        payload.tenderId = null
      }
      if (payload.type === 'tender') {
        payload.productId = null
      }

      return payload
    },

    async onCreate() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Создать сделку?', 'Сделка не создана')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('deals').create(this.getPayload())
      } catch (err) {
        handleApiError(this, err, 'Не удалось создать сделку')
        return false
      }

      this.$message({
        message: 'Сделка создана!',
        type: 'success',
      })

      this.$router.push({ name: 'Deals' })
      return true
    },
  },
}
</script>

<style scoped>
.deal-create .el-select,
.deal-create .el-date-editor {
  width: 100%;
}
</style>
