<template>
  <div class="app-container companies-form">
    <el-tabs type="card">
      <el-tab-pane label="Мой профиль">
        <el-form
          ref="ruleForm"
          :rules="rules"
          :model="form"
          label-width="160px"
          label-position="top"
        >
          <el-row>
            <h2>Общая информация</h2>
            <el-col :span="7">
              <el-form-item label="ФИО" prop="fullName">
                <el-input v-model="form.fullName" />
              </el-form-item>
            </el-col>

            <el-col :span="7" :offset="1">
              <el-form-item label="Наименование организации/ИП" prop="organizationName">
                <el-input v-model="form.organizationName" />
              </el-form-item>
            </el-col>

            <el-col :span="7" :offset="1">
              <el-form-item label="Тип компании" prop="organizationType">
                <AsyncSelect
                  :value="form.organizationType"
                  service="companies"
                  label="organizationType"
                  placeholder="Выберите тип"
                  @value-changed="v => (form.organizationType = v)"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="7">
              <el-form-item prop="countryId" label="Страна">
                <AsyncSelect
                  :value="form.countryId"
                  :reduce="val => val.countryId"
                  service="countries"
                  label="name"
                  placeholder="Выберите страну"
                  @value-changed="v => (form.countryId = v)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="15" :offset="1">
              <el-form-item label="Адрес" prop="address">
                <el-input v-model="form.address" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <h2>Юридические данные</h2>
            <el-col :span="7">
              <el-form-item label="ИНН" prop="taxpayerNumber">
                <el-input v-model="form.taxpayerNumber" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="КПП" prop="iec">
                <el-input v-model="form.iec" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="ОГРН" prop="psrn">
                <el-input v-model="form.psrn" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="23">
              <el-form-item label="ОГРНИП" prop="psrnsp">
                <el-input v-model="form.psrnsp" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.bankAccount">
            <h2>Данные счёта</h2>
            <el-col :span="7">
              <el-form-item label="Расчётный счёт" prop="currentAccount">
                <el-input v-model="form.bankAccount.currentAccount" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="Корреспондентский счёт" prop="correspondingAccount">
                <el-input v-model="form.bankAccount.correspondingAccount" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="БИК" prop="bic">
                <el-input v-model="form.bankAccount.bic" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.bankAccount">
            <el-col :span="23">
              <el-form-item label="Банк" prop="bankName">
                <el-input v-model="form.bankAccount.bankName" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <h2>Авторизационные данные</h2>
            <el-col :span="11">
              <el-form-item label="Почта" prop="email">
                <el-input v-model="form.email" />
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="1">
              <el-form-item label="Номер телефона" prop="phone">
                <el-input v-model="form.phone" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <h2>Контактное лицо</h2>
            <el-col :span="7">
              <el-form-item label="ФИО" prop="contactFullName">
                <el-input v-model="form.contactFullName" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="Почта" prop="contactEmail">
                <el-input v-model="form.contactEmail" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="Номер телефона" prop="contactPhone">
                <el-input v-model="form.contactPhone" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <h2>Руководитель</h2>
            <el-col :span="7">
              <el-form-item label="ФИО" prop="directorFullName">
                <el-input v-model="form.directorFullName" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="Почта" prop="directorEmail">
                <el-input v-model="form.directorEmail" />
              </el-form-item>
            </el-col>
            <el-col :span="7" :offset="1">
              <el-form-item label="Номер телефона" prop="directorPhone">
                <el-input v-model="form.directorPhone" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col>
              <h2>Документы</h2>
              <el-upload
                :on-preview="handlePreview"
                :on-success="handleChange"
                :on-remove="handleRemove"
                :file-list="form.documents"
                :headers="headerInfo"
                action="https://api.agrostock.pro/uploads"
                class="document"
                multiple
                list-type="picture"
              >
                <el-button size="small" type="primary">Загрузить</el-button>
              </el-upload>
            </el-col>
          </el-row>
          
          <el-row style="margin-bottom: 22px">
            <el-col>
              <h2>Баланс</h2>
              <p>{{balance}}</p>
            </el-col>
          </el-row>

          <el-row>
            <el-form-item>
              <el-button type="primary" @click="onEdit">Изменить</el-button>
              <el-button @click="onCancel">Отмена</el-button>
              <el-button type="danger" @click="onBlock">Заблокировать</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Просмотр профиля">
        <h2>Сделки</h2>
        <Deals :company-id="form.id" />
        <h2>Арбитражы</h2>
        <Arbitrations :company-id="form.id" />
        <h2>Выставленные товары</h2>
        <Products :company-id="form.id" />
        <h2>Выставленные торги</h2>
        <Tenders :company-id="form.id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'
import Deals from '@/views/deals'
import Arbitrations from '@/views/arbitration'
import Products from '@/views/products'
import Tenders from '@/views/tenders'
import { mapGetters } from 'vuex'

export default {
  name: 'CompaniesForm',

  components: {
    AsyncSelect,
    Deals,
    Arbitrations,
    Products,
    Tenders,
  },

  mixins: [validateForm, confirmUpdate],

  data() {
    return {
      form: { id: this.$route.params.id },
      show: false,
      balance: '',
      rules: {},
    }
  },

  computed: {
    ...mapGetters({
      token: 'user/token',
    }),
    headerInfo() {
      return {
        Authorization: `Bearer ${this.token}`,
      }
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
    async init() {
      await this.fetchData()
    },

    handleRemove(file) {
      if (this.form.documents.length) {
        this.form.documentsIds = this.form.documentsIds.filter(item => item !== file.id)
        return
      }

      this.form.documentsIds = this.form.documentsIds.filter(item => item !== file.response[0].id)
    },

    handlePreview(file) {
      window.open(file.path || file.response[0].path, '_blank')
    },

    handleChange(file) {
      this.form.documentsIds = [...this.form.documentsIds, file[0].id]
    },

    getImgPath(url) {
      if (url.match('.(jpg|png|bmp|ico|jpeg)$')) {
        return url
      }

      if (url.match('.(pdf)$')) {
        return 'https://aw-store.ru/upload/iblock/462/4621234c71b09c6cbf9b22f7b0164d50.png'
      }

      if (url.match('.(txt)$')) {
        return 'https://img.icons8.com/ios/452/txt.png'
      }

      if (url.match('.(doc|docx)$')) {
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/.docx_icon.svg/1200px-.docx_icon.svg.png'
      }

      return 'https://i.pinimg.com/originals/7f/d2/e4/7fd2e46b2da9819e667fb75caf475cf7.png'
    },

    async fetchData() {
      const companiesService = this.$apiClient.service('companies')
      const companiesBalancesServices = this.$apiClient.service('companies-balances')
      const res = await companiesService.get(this.$route.params.id)
      const balance = await companiesBalancesServices.get(this.$route.params.id)

      console.log(res)

      this.form = res
      this.form.documents.forEach(item => {
        item.name = item.originalname
        item.url = this.getImgPath(item.path)
      })

      this.balance = balance.balance
    },

    async onEdit() {
      this.form.documents.forEach(item => (delete item.name, delete item.url))

      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Сохранить изменения компании?', 'Данные компании не изменены')
      } catch (err) {
        return false
      }

      const companiesService = this.$apiClient.service('companies')

      try {
        await companiesService.patch(this.$route.params.id, {
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
        message: 'Компания изменена!',
        type: 'success',
      })

      this.$router.push({ name: 'Companies' })
    },

    async onCancel() {
      try {
        await this.confirmUpdate(
          'Оменить изменения компании?',
          'Продолжайте редактирование компании'
        )
      } catch (err) {
        return false
      }

      this.$message({
        message: 'Данные компании не изменены!',
        type: 'warning',
      })

      this.$router.push({ name: 'Companies' })
    },

    async onBlock(){
      try {
        await this.confirmUpdate('Заблокировать пользователя?', 'Отмена')
      } catch (err) {
        return false
      }

      const blockUserService = this.$apiClient.service('block-user')

      try {
        await blockUserService.create({userId: this.form.userId})
      } catch (err) {
        this.$message({
          message: err.message,
          type: 'error',
        })
        return false
      }

      this.$message({
        message: 'Пользователь заблокирован!',
        type: 'success',
      })

      this.$router.push({ name: 'Companies' })
    },
  },
}
</script>

<style lang="scss" scoped>
h2 {
  padding-bottom: 10px;
  margin: 0;
  color: #fc6e20;
  border-bottom: 1px solid #fff0e8;
  font-size: 18px;
  font-weight: 500;
}

.document {
  margin: 20px 0;
}
</style>
