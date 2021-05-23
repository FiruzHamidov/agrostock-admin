<template>
  <div class="app-container tender-form">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <el-row>
        <el-col :span="11">
          <el-form-item label="Название" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>

        <el-col :span="5" :offset="1">
          <el-form-item prop="categoryId" label="Категория">
            <AsyncSelect
              :value="form.categoryId"
              service="categories"
              label="name"
              placeholder="Выберите категорию"
              @value-changed="v => form.categoryId = v"
            />
          </el-form-item>
        </el-col>

        <el-col :span="3" :offset="1">
          <el-form-item label="Начальная цена" prop="startPrice">
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
      </el-row>

      <el-row>
        <el-col :span="11">
          <el-form-item prop="description" label="Описание">
            <el-input
              v-model="form.description"
              :autosize="{ minRows: 9, maxRows: 9 }"
              type="textarea"
              placeholder="Введите описание..."
            />
          </el-form-item>
        </el-col>

        <el-col :span="11" :offset="1">
          <div class="types">
            <el-row>
              <el-col :span="11">
                <el-form-item label="Тип" prop="type">
                  <el-select v-model="form.type" placeholder="Выберите тип">
                    <el-option
                      v-for="item in types"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="7" :offset="2">
                <el-form-item label="Обьем" prop="batchSize">
                  <el-input v-model="form.batchSize" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="тип" prop="batchSizeUnit">
                  <el-select v-model="form.batchSizeUnit" placeholder="тип">
                    <el-option
                      v-for="item in batchUnitSizes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row>
              <el-col :span="11">
                <el-form-item label="Налог" prop="taxType">
                  <el-select v-model="form.taxType" placeholder="Выберите тип">
                    <el-option
                      v-for="item in taxTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="11" :offset="2">
                <el-form-item label="Дата начала" prop="dateStart">
                  <el-date-picker
                    v-model="form.dateStart"
                    type="datetime"
                    placeholder="Date"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row>
              <el-col :span="11">
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

              <el-col :span="11" :offset="2">
                <el-form-item label="Дата завершения" prop="dateEnd">
                  <el-date-picker
                    v-model="form.dateEnd"
                    type="datetime"
                    placeholder="Date"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
          </div>
        </el-col>
      </el-row>

      <br>

      <el-row>
        <el-col :span="5">
          <div>
            <el-form-item prop="countryId" label="Место нахождения">
              <AsyncSelect
                :value="form.countryId"
                :reduce="val => val.country_id"
                service="countries"
                label="name"
                placeholder="Выберите страну"
                @value-changed="v => form.countryId = v"
              />
            </el-form-item>

            <el-form-item prop="cityId" label="Город">
              <AsyncSelect
                :value="form.cityId"
                :reduce="val => val.city_id"
                :additional-query="{ country_id: form.countryId }"
                service="cities"
                label="name"
                placeholder="Выберите город"
                @value-changed="v => form.cityId = v"
              />
            </el-form-item>

            <el-form-item label="Адрес" prop="address">
              <el-input v-model="form.address" />
            </el-form-item>
          </div>
        </el-col>

        <el-col :span="5" :offset="1">
          <div>
            <el-form-item prop="productionCountryId" label="Место происхождения">
              <AsyncSelect
                :value="form.productionCountryId"
                :reduce="val => val.country_id"
                service="countries"
                label="name"
                placeholder="Выберите страну"
                @value-changed="v => form.productionCountryId = v"
              />
            </el-form-item>

            <el-form-item prop="productionCityId" label="Город">
              <AsyncSelect
                :value="form.productionCityId"
                :reduce="val => val.city_id"
                :additional-query="{ country_id: form.productionCountryId }"
                service="cities"
                label="name"
                placeholder="Выберите город"
                @value-changed="v => form.productionCityId = v"
              />
            </el-form-item>

          </div>
        </el-col>

        <el-col :span="5" :offset="1">
          <div>
            <el-form-item label="Доставка" prop="deliveryDescription">
              <el-input v-model="form.deliveryDescription" />
            </el-form-item>

            <el-form-item label="Тип упаковки" prop="packagingType">
              <el-select v-model="form.packagingType" placeholder="Тип упаковки">
                <el-option
                  v-for="item in packagingTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item prop="deliveryPrice">
              <el-form-item>
                <el-checkbox v-model="form.isDeliveryIncludesInPrice">
                  Доставка включена в стоимость
                </el-checkbox>
              </el-form-item>
              <el-input
                v-model="form.deliveryPrice"
                type="number"
              />
            </el-form-item>
          </div>
        </el-col>

        <el-col :span="5" :offset="1">
          <el-form-item :label="`Размер обеспечения участия - ${((form.participationAmount / 100) * +form.startPrice).toFixed(2)}`" prop="participationAmount">
            <vue-slider v-model="form.participationAmount" :min="1" :max="10" :interval="1" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- <Upload :id="form.photoId" /> -->

      <el-form-item>
        <el-button type="primary" @click="onEdit"> Изменить </el-button>
        <el-button @click="onCancel">Отмена</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import Upload from '@/components/Upload'
import AsyncSelect from '@/components/AsyncSelect'

import { packagingTypes, batchUnitSizes, taxTypes, currencies } from '@/utils/variables'

export default {
  name: 'TenderForm',

  components: {
    VueSlider,
    Upload,
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        name: '',
        countryId: null,
      },
      types: [{ value: 'sell', label: 'Продажа' }, { value: 'buy', label: 'Покупка' }],
      statuses: [
        { value: 'wait', label: 'В ожидание' },
        { value: 'active', label: 'Активен' },
        { value: 'cancelled', label: 'Отменен' },
        { value: 'suspended', label: 'Приостановлен' },
        { value: 'doneWithWinner', label: 'Завершен (есть победитель)' },
        { value: 'doneWithoutWinner', label: 'Завершен (нет победителя)' },
        { value: 'banned', label: 'Заблокирован' },
      ],
      packagingTypes,
      batchUnitSizes,
      taxTypes,
      currencies,

      show: false,
      rules: {
        // name: [{ required: true, message: 'Введите название торги', trigger: 'blur' }],
      },
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
      const tenderService = this.$apiClient.service('tenders')
      const res = await tenderService.get(this.$route.params.id)

      this.form = res
    },

    async onEdit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Сохранить изменения торги?', 'Торги не изменена')
      } catch (err) {
        return false
      }

      const tenderService = this.$apiClient.service('tenders')

      try {
        await tenderService.patch(this.$route.params.id, {
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
        message: 'Торги изменена!',
        type: 'success',
      })

      this.$router.push({ name: 'Tenders' })
    },

    async onCancel() {
      try {
        await this.confirmUpdate('Оменить изменения торги?', 'Продолжайте редактирование торги')
      } catch (err) {
        return false
      }

      this.$message({
        message: 'Торги не изменена!',
        type: 'warning',
      })

      this.$router.push({ name: 'Tenders' })
    },
  },
}
</script>

<style lang="scss">
.line {
  text-align: center;
}
.tenders-table {
  display: flex;
  flex-direction: row;
}
.tender-form {
  .el-form-item__label {
    line-height: 10px;
  }
  .el-select {
    width: 100%;
  }
}
</style>
