<template>
  <div class="app-container deal-form">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <el-row class="flex center">
        <el-col :span="12">
          <h3 class="timer">
            Покупатель резервирует средства |&emsp;
            <vue-countdown-timer
              :start-time="Date.now()"
              :end-time="new Date(form.createdAt).getTime() + 1000 * 60 * 60 * 24 * 3"
              :interval="1000"
              :end-text="'Покупатель не зарезирвировал средства'"
              :day-txt="''"
              :hour-txt="'часов'"
              :minutes-txt="'минут'"
              :seconds-txt="'секунд'"
            />
          </h3>
        </el-col>
        <el-col :span="12" class="t-a-c">
          <el-button type="success" @click="showDocuments = true">Просмотреть документы</el-button>
          <el-dialog :visible.sync="showDocuments" title="Документы">
            <template v-if="form.documents.length">
              <p v-for="document in form.documents" :key="document">{{ document }}</p>
            </template>
            <p v-else>Документов нет</p>
          </el-dialog>
          <template v-if="!isArbitr">
            <el-button type="warning" @click="isArbitr = true">Арбитраж</el-button>
            <el-button type="warning" style="margin: 0;">Отменить</el-button>
          </template>
          <el-button v-else type="warning">Сделка на арбитраже</el-button>
        </el-col>
      </el-row>

      <el-row class="progress">
        <el-col :span="24" :offset="3">
          <el-steps :space="getInnerWidth()" :active="activeStep" finish-status="success">
            <el-step title="Резервирование средств" />
            <el-step title="Отправка товара" />
            <el-step title="Закрытие сделки" />
          </el-steps>
        </el-col>
      </el-row>

      <!-- FIXME: remove unusable class 'rel' after chat implement -->
      <el-row class="rel">
        <el-col :span="12">
          <el-carousel :interval="5000" arrow="always">
            <el-carousel-item v-for="item in 4" :key="item">
              <h3>{{ item }}</h3>
            </el-carousel-item>
          </el-carousel>

          <el-row>
            <el-col :span="24">
              <el-col :span="5">
                <h5>Цена</h5>
                <p>
                  {{ form.price }}
                  <span class="success">{{ currencySymbols[form.currency] }}</span>
                </p>
              </el-col>
              <el-col :span="9">
                <el-form-item label="Обьем" prop="batchSize">
                  <el-input v-model="form.batchSize" type="number" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
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
              <el-col :span="5" :offset="1" style="text-align:right;">
                <h5>Статус</h5>
                <p>
                  {{ form.status }}
                </p>
              </el-col>
            </el-col>
          </el-row>

          <el-row class="description">
            <el-col :span="24">
              <h5>Описание</h5>
              <p>
                {{ form.description }}
              </p>
            </el-col>
          </el-row>
        </el-col>

        <el-col :span="10" :offset="2" class="chat">
          <div />
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

import { batchUnitSizes, currencies, currencySymbols } from '@/utils/variables'

export default {
  name: 'DealsForm',

  components: {
    AsyncSelect,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: {
        batchSize: null,
        address: null,
      },
      statuses: [
        { value: 'reserveFunds', label: 'Резервирование' },
        { value: 'sendProduct', label: 'Отправка товара' },
        { value: 'done', label: 'Закрытие сделки' },
      ],
      batchUnitSizes,
      currencies,
      currencySymbols,
      show: false,
      rules: {
        batchSize: [{ required: true, message: 'Введите объем' }],
        address: [{ required: true, message: 'Введите адрес' }],
      },
      isArbitr: false,
      showDocuments: false,
      activeStep: 0,
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

    getInnerWidth() {
      return window.innerWidth / 2 - 50
    },

    changeActiveStep(stageStatus) {
      switch (stageStatus) {
        case 'reserveFunds':
          return (this.activeStep = 0)
        case 'sendProduct':
          return (this.activeStep = 1)
        case 'done':
          return (this.activeStep = 2)
        default:
          return (this.activeStep = 3)
      }
    },

    async fetchData() {
      const dealService = this.$apiClient.service('deals')
      const res = await dealService.get(this.$route.params.id)

      this.form = res
      this.changeActiveStep(res.stageStatus)
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

<style lang="scss" scoped>
.timer {
  font-size: 16px;
  font-weight: 400;

  & > div {
    color: red;
    display: inline-block;
    font-style: normal;
  }
}

.flex {
  display: flex;
}

.center {
  align-items: center;
  justify-content: space-between;
}

.between {
  justify-content: space-between;
  align-items: center;
}

.t-a-c {
  text-align: center;
}

.success {
  color: #67c23a;
}

.progress {
  margin: 30px auto;
}

.rel {
  position: relative;
}

.chat {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  border: 1px solid black;
  transform: translateX(120%);
}

h5 {
  color: #606266;
  margin: 0;
  padding-bottom: 5px;
  font-size: 14px;
  line-height: 40px;
}

p {
  color: #606266;
}
</style>
