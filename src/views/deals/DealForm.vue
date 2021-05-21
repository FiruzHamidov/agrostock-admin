<template>
  <div class="app-container deal-form">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <el-row>
        <el-col :span="2">
          <el-form-item label="Цена" prop="startPrice">
            <el-input v-model="form.startPrice" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-form-item label="Валюта" prop="currency">
            <el-select v-model="form.currency" placeholder="тип">
              <el-option
                v-for="item in currencies"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="2" :offset="1">
          <el-form-item label="Обьем" prop="batchSize">
            <el-input v-model="form.batchSize" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-form-item label="тип" prop="batchSizeUnit">
            <el-select v-model="form.batchSizeUnit" placeholder="Тип">
              <el-option
                v-for="item in batchUnitSizes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4" :offset="1">
          <el-form-item label="Статус" prop="status">
            <el-select v-model="form.status" placeholder="Выберите статус">
              <el-option
                v-for="item in statuses"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="14">
          <el-form-item prop="description" label="Описание">
            <el-input
              v-model="form.description"
              :autosize="{ minRows: 5, maxRows: 5 }"
              type="textarea"
              placeholder="Введите описание..."
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <el-form-item prop="countryId" label="Страна получения">
            <AsyncSelect
              :value="form.countryId"
              :reduce="val => val.country_id"
              service="countries"
              label="title_ru"
              placeholder="Выберите страну"
              @value-changed="v => (form.countryId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4" :offset="1">
          <el-form-item prop="cityId" label="Город">
            <AsyncSelect
              :value="form.cityId"
              :reduce="val => val.city_id"
              :additional-query="{ country_id: form.countryId }"
              service="cities"
              label="title_ru"
              placeholder="Выберите город"
              @value-changed="v => (form.cityId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="4" :offset="1">
          <el-form-item label="Адрес" prop="address">
            <el-input v-model="form.address" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="onEdit"> Изменить </el-button>
        <el-button @click="onCancel">Отмена</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'

import { batchUnitSizes, currencies } from '@/utils/variables'

export default {
  name: 'DealsForm',

  components: {
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        name: '',
        countryId: null,
      },
      statuses: [
        { value: 'reserveFunds', label: 'Резервирование' },
        { value: 'dispatchGoogs', label: 'Отправка товара' }, // value ??
        { value: 'closeDeal', label: 'Закрытие сделки' }, // value ??
      ],
      batchUnitSizes,
      currencies,

      show: false,
      rules: {},
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
    this.init()
  },

  methods: {
    async init() {
      await this.fetchData()
    },

    async fetchData() {
      const dealService = this.$apiClient.service('deals')
      const res = await dealService.get(this.$route.params.id)

      this.form = res
    },

    async onEdit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Сохранить изменения сделки?', 'Сделка не изменена')
      } catch (err) {
        return false
      }

      const dealService = this.$apiClient.service('deals')

      try {
        await dealService.patch(this.$route.params.id, {
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
        message: 'Сделка изменена!',
        type: 'success',
      })

      this.$router.push({ name: 'Deals' })
    },

    async onCancel() {
      try {
        await this.confirmUpdate('Оменить изменения сделки?', 'Продолжайте редактирование сделки')
      } catch (err) {
        return false
      }

      this.$message({
        message: 'Сделка не изменена!',
        type: 'warning',
      })

      this.$router.push({ name: 'Deals' })
    },
  },
}
</script>
