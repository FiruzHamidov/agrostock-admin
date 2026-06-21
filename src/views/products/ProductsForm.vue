<template>
  <div class="app-container product-form">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <el-row class="flex center bottom-line">
        <el-col :span="12" :offset="2" class="flex label-padding">
          <el-form-item label="Статус объявления" prop="status">
            <el-select v-model="form.status" :placeholder="form.status">
              <el-option
                v-for="item in statuses"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item>
            <el-button
              v-for="type in types"
              :key="type.value"
              :type="form.type === type.value ? 'success' : ''"
              round
              @click="form.type = type.value"
            >{{ type.label }}</el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="11">
          <el-form-item prop="companyId" label="Компания">
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
      </el-row>

      <el-row>
        <el-col :span="5">
          <el-form-item label="Наименование товара" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="1">
          <el-form-item prop="countryId" label="Место нахождение товара">
            <AsyncSelect
              :value="form.country"
              :reduce="val => val.country_id"
              service="countries"
              label="name"
              placeholder="Выберите страну"
              @value-changed="onCountryChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="1">
          <el-form-item prop="cityId" label="Город">
            <AsyncSelect
              :value="form.city"
              :reduce="val => val.city_id"
              :additional-query="cityQuery"
              :query-limit="50"
              service="cities"
              label="name"
              placeholder="Выберите город"
              @value-changed="v => (form.cityId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="1">
          <el-form-item label="Адрес" prop="address">
            <el-input v-model="form.address" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row class="flex">
        <el-col :span="5">
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
        <el-col :span="5" :offset="1">
          <el-form-item prop="productionCountryId" label="Место происхождения товара">
            <AsyncSelect
              :value="form.productionCountry"
              :reduce="val => val.country_id"
              service="countries"
              label="name"
              placeholder="Выберите страну"
              @value-changed="onProductionCountryChange"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="5" :offset="1">
          <el-form-item prop="productionCityId" label="Город">
            <AsyncSelect
              :value="form.productionCity.name"
              :reduce="val => val.city_id"
              :additional-query="{ country_id: form.productionCountryId }"
              service="cities"
              label="name"
              placeholder="Выберите город"
              @value-changed="v => (form.productionCityId = v)"
            />
          </el-form-item>
        </el-col> -->
        <el-col :span="5" :offset="1">
          <h4>Возможна безопасная сделка?</h4>
          <el-radio v-model="form.isSafePossible" :label="true">Да</el-radio>
          <el-radio v-model="form.isSafePossible" :label="false">Нет</el-radio>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="3">
          <el-form-item label="Цена за единицу" prop="unitPrice">
            <el-input v-model="form.unitPrice" type="number" />
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
        <el-col :span="3" :offset="1">
          <el-form-item label="Обьем" prop="batchSize">
            <el-input v-model="form.batchSize" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="2">
          <el-form-item label="Тип" prop="batchSizeUnit">
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
        <el-col :span="5" :offset="1">
          <h4>Статус</h4>
          <div class="flex between radioWrap">
            <el-radio v-model="form.clearance" label="importRussia">Импорт РФ</el-radio>
            <el-radio v-model="form.clearance" label="importEurope">Импорт ЕАС</el-radio>
            <el-radio v-model="form.clearance" label="importFEZ">Импорт СЭЗ</el-radio>
            <el-radio v-model="form.clearance" label="fromRussia">Товар РФ</el-radio>
          </div>
        </el-col>
        <el-col :span="5" :offset="1">
          <h4>Финальная цена?</h4>
          <el-radio v-model="form.isFinalPrice" :label="true">Да</el-radio>
          <el-radio v-model="form.isFinalPrice" :label="false">Нет</el-radio>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="16">
          <el-form-item prop="categoryId" label="Категория">
            <AsyncSelect
              :value="form.category"
              :reduce="val => val.id"
              service="categories"
              label="name"
              placeholder="Выберите категорию"
              @value-changed="v => (form.categoryId = v)"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6" :offset="1">
          <el-form-item label="Сорт/Качество" prop="grade">
            <el-input v-model="form.grade" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="16">
          <el-form-item prop="description" label="Описание">
            <el-input
              v-model="form.description"
              :autosize="{ minRows: 9, maxRows: 9 }"
              type="textarea"
              placeholder="Введите описание..."
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="1">
          <el-row>
            <el-col>
              <el-form-item label="Упаковка" prop="packagingType">
                <el-select v-model="form.packagingType" placeholder="Тип упаковки" class="w100">
                  <el-option
                    v-for="item in packagingTypes"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col>
              <el-form-item label="Калибр" prop="caliber">
                <el-input v-model="form.caliber" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <h4>Фотографии <span>Используйте 200x200 px для лучшего обзора.</span></h4>
          <div class="photo">
            <template v-if="form.photos.length">
              <Upload
                v-for="photo in form.photos"
                :id="photo.id"
                :key="photo.id"
                @on-delete="deletePhoto(photo.id)"
                @on-change="changePhoto"
              />
            </template>
            <template v-else>
              <Upload @on-change="changePhoto" @on-delete="deletePhoto" />
            </template>
          </div>
        </el-col>
      </el-row>

      <el-row class="m-t-2">
        <el-form-item>
          <el-button type="primary" @click="onEdit">{{ isEdit ? 'Изменить' : 'Создать' }}</el-button>
          <el-button @click="onCancel">Отмена</el-button>
          <el-button v-if="isEdit" type="danger" plain @click="onDelete">Удалить</el-button>
          <el-button v-if="isEdit && form.status === 'active'" @click="onBan">Заблокировать</el-button>
          <el-button v-if="isEdit && form.status === 'banned'" @click="onRestore">Разблокировать</el-button>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'
import Upload from '@/components/Upload'
import { handleApiError } from '@/utils/api-error'

import { packagingTypes, batchUnitSizes, taxTypes, currencies } from '@/utils/variables'

export default {
  name: 'ProductsForm',

  components: {
    Upload,
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: this.getDefaultForm(),
      types: [{ value: 'buy', label: 'Покупаю' }, { value: 'sell', label: 'Продаю' }],
      statuses: [
        { label: 'Ожидает', value: 'pending' },
        { label: 'Активен', value: 'active' },
        { label: 'Закрыт', value: 'closed' },
        { label: 'Заблокирован', value: 'banned' },
        { label: 'Отклонен', value: 'rejected' },
      ],
      packagingTypes,
      batchUnitSizes,
      taxTypes,
      currencies,
      show: false,
      rules: {},
    }
  },

  computed: {
    isEdit() {
      return Boolean(this.$route.params.id)
    },

    cityQuery() {
      return this.form.countryId ? { country_id: this.form.countryId } : {}
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
        type: 'sell',
        status: 'pending',
        name: '',
        countryId: null,
        cityId: null,
        country: null,
        city: null,
        productionCountryId: null,
        productionCountry: null,
        categoryId: null,
        category: null,
        companyId: null,
        company: null,
        address: '',
        taxType: '',
        isSafePossible: false,
        unitPrice: '',
        currency: '',
        batchSize: '',
        batchSizeUnit: '',
        clearance: '',
        isFinalPrice: false,
        grade: '',
        description: '',
        packagingType: '',
        caliber: '',
        photos: [],
        photosIds: [],
      }
    },

    async init() {
      await this.fetchData()
    },

    async fetchData() {
      if (!this.isEdit) {
        this.form = this.getDefaultForm()
        return true
      }

      const productsService = this.$apiClient.service('products')
      let res
      try {
        res = await productsService.get(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось получить товар')
        return false
      }

      this.form = {
        ...this.getDefaultForm(),
        ...res,
        country: res.country || null,
        city: res.city || null,
        productionCountry: res.productionCountry || null,
        category: res.category || null,
        company: res.company || null,
        photos: Array.isArray(res.photos) ? res.photos : [],
        photosIds: Array.isArray(res.photosIds)
          ? res.photosIds
          : Array.isArray(res.photos)
            ? res.photos.map(photo => photo.id)
            : [],
      }
    },

    async deletePhoto(id) {
      try {
        await this.confirmUpdate('Вы действительно хотите удалить фото?', 'Фото не будет удалено')
        this.form.photosIds = id ? this.form.photosIds.filter(item => item !== id) : []
        this.form.photos = id ? this.form.photos.filter(item => item.id !== id) : []
        this.$message({
          message: 'Фото будет удалено при изменении',
          type: 'success',
        })
      } catch (err) {
        return false
      }
    },

    changePhoto(id, newId) {
      if (id === 0) {
        this.form.photosIds = [newId]
        return
      }

      const index = this.form.photosIds.findIndex(item => item === id)
      if (index === -1) {
        this.form.photosIds = [...this.form.photosIds, newId]
        return
      }
      this.form.photosIds.splice(index, 1, newId)
    },

    onCountryChange(countryId) {
      this.form.countryId = countryId
      this.form.cityId = null
      this.form.city = null
    },

    onProductionCountryChange(countryId) {
      this.form.productionCountryId = countryId
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

      const name =
        company.organizationName ||
        company.fullName ||
        company.username ||
        company.email ||
        company.phone

      return name ? `${name} #${company.id}` : `Компания #${company.id}`
    },

    getPayload() {
      const fields = [
        'type',
        'status',
        'name',
        'companyId',
        'unitPrice',
        'currency',
        'batchSize',
        'batchSizeUnit',
        'taxType',
        'clearance',
        'isFinalPrice',
        'description',
        'grade',
        'packagingType',
        'caliber',
        'address',
        'isSafePossible',
        'countryId',
        'cityId',
        'productionCountryId',
        'categoryId',
        'photosIds',
      ]

      return fields.reduce((payload, field) => {
        payload[field] = this.form[field]
        return payload
      }, {})
    },

    async onEdit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate(
          this.isEdit ? 'Сохранить изменения товара?' : 'Создать товар?',
          this.isEdit ? 'Товар не изменен' : 'Товар не создан'
        )
      } catch (err) {
        return false
      }

      const productsService = this.$apiClient.service('products')
      const payload = this.getPayload()

      try {
        if (this.isEdit) {
          await productsService.patch(this.$route.params.id, payload)
        } else {
          await productsService.create(payload)
        }
      } catch (err) {
        handleApiError(this, err, this.isEdit ? 'Не удалось обновить товар' : 'Не удалось создать товар')
        return false
      }

      this.$message({
        message: this.isEdit ? 'Товар изменен!' : 'Товар создан!',
        type: 'success',
      })

      this.$router.push({ name: 'Products' })
    },

    async onBan() {
      try {
        await this.confirmUpdate('Точно хотите заблокировать товар?', 'Товар не заблокирован')
      } catch (err) {
        return false
      }

      const productsService = this.$apiClient.service('products')

      try {
        await productsService.patch(this.$route.params.id, {
          status: 'banned',
        })
      } catch (err) {
        handleApiError(this, err, 'Не удалось изменить статус товара')
        return false
      }

      this.$message({
        message: 'Товар заблокирован!',
        type: 'success',
      })

      this.fetchData()
    },

    async onRestore() {
      try {
        await this.confirmUpdate('Точно хотите разблокировать товар?', 'Товар не разблокирован')
      } catch (err) {
        return false
      }

      const productsService = this.$apiClient.service('products')

      try {
        await productsService.patch(this.$route.params.id, {
          status: 'active',
        })
      } catch (err) {
        handleApiError(this, err, 'Не удалось изменить статус товара')
        return false
      }

      this.$message({
        message: 'Товар разблокирован!',
        type: 'success',
      })

      this.fetchData()
    },

    async onCancel() {
      try {
        await this.confirmUpdate('Оменить изменения товара?', 'Продолжайте редактирование товара')
      } catch (err) {
        return false
      }

      this.$message({
        message: 'Товар не изменен!',
        type: 'warning',
      })

      this.$router.push({ name: 'Products' })
    },

    async onDelete() {
      try {
        await this.confirmUpdate('Точно удалить товар?', 'Удаление отменено')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('products').remove(this.$route.params.id)
      } catch (err) {
        handleApiError(this, err, 'Не удалось удалить товар')
        return false
      }

      this.$message({
        message: 'Товар удален!',
        type: 'success',
      })

      this.$router.push({ name: 'Products' })
      return true
    },
  },
}
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  align-items: center;
}

.center {
  justify-content: center;
}

.between {
  justify-content: space-between;
}

.label-padding {
  .el-form-item__label {
    padding: 0 20px 0 0;
  }
}

.bottom-line {
  border-bottom: 1px solid rgba(207, 132, 19, 0.2);
}

h4 {
  color: #606266;
  margin: 0;
  padding-bottom: 5px;
  font-size: 14px;
  line-height: 40px;

  span {
    margin-left: 20px;
    font-size: 12px;
  }
}

.radioWrap {
  flex-wrap: wrap;

  .el-radio {
    margin: 0 0 10px 0;
    width: 100px;
  }
}

.w100 {
  width: 100%;
}

.m-t-2 {
  margin-top: 2rem;
}

.photo {
  margin-top: 10px;

  .el-form-item__label {
    display: none;
  }
}
</style>
