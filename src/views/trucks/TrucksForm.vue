<template>
  <div class="app-container">
    <el-form ref="ruleForm" :model="form" label-width="160px" label-position="top">
      <el-row>
        <el-col :span="8">
          <el-form-item label="Название">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Номер/гос. знак">
            <el-input v-model="form.number" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Статус объявления">
            <el-select v-model="form.status" placeholder="Выберите статус" class="w100">
              <el-option label="Активен" value="active" />
              <el-option label="Оффлайн" value="offline" />
              <el-option label="Заблокирован" value="banned" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Марка">
            <el-input v-model="form.brand" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Модель">
            <el-input v-model="form.model" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Год">
            <el-input v-model="form.year" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Страна">
            <AsyncSelect
              :value="form.country.name"
              :reduce="val => val.country_id"
              service="countries"
              label="name"
              placeholder="Выберите страну"
              @value-changed="v => (form.countryId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Город">
            <AsyncSelect
              :value="form.city.name"
              :reduce="val => val.city_id"
              :additional-query="{ country_id: form.countryId }"
              service="cities"
              label="name"
              placeholder="Выберите город"
              @value-changed="v => (form.cityId = v)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Адрес">
            <el-input v-model="form.address" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Тип кузова">
            <el-input v-model="form.bodyType" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Грузоподъемность (кг)">
            <el-input v-model="form.capacity" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Объем (м3)">
            <el-input v-model="form.volume" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="Комментарий модерации">
            <el-input
              v-model="form.moderationComment"
              :autosize="{ minRows: 3, maxRows: 6 }"
              type="textarea"
              placeholder="Комментарий для компании"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row class="m-t-2">
        <el-form-item>
          <el-button type="primary" @click="onSave">
            {{ isEdit ? 'Изменить' : 'Создать' }}
          </el-button>
          <el-button @click="onCancel">Отмена</el-button>
          <el-button v-if="isEdit && form.status !== 'banned'" @click="onBan">Заблокировать</el-button>
          <el-button v-if="isEdit && form.status === 'banned'" @click="onRestore">Разблокировать</el-button>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'

export default {
  name: 'TrucksForm',

  components: {
    AsyncSelect,
  },

  mixins: [confirmUpdate],

  data() {
    return {
      form: this.getDefaultForm(),
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
        name: '',
        number: '',
        brand: '',
        model: '',
        year: null,
        bodyType: '',
        capacity: null,
        volume: null,
        countryId: null,
        cityId: null,
        address: '',
        moderationComment: '',
        status: 'active',
        country: {},
        city: {},
      }
    },

    async init() {
      if (!this.isEdit) {
        this.form = this.getDefaultForm()
        return
      }

      await this.fetchData()
    },

    async fetchData() {
      const trucksService = this.$apiClient.service('trucks')
      const res = await trucksService.get(this.$route.params.id)

      this.form = {
        ...this.getDefaultForm(),
        ...res,
        country: res.country || {},
        city: res.city || {},
      }
    },

    async onSave() {
      const trucksService = this.$apiClient.service('trucks')

      try {
        await this.confirmUpdate(
          this.isEdit ? 'Сохранить изменения грузовика?' : 'Создать грузовик?',
          this.isEdit ? 'Изменения отменены' : 'Создание отменено'
        )
      } catch (err) {
        return false
      }

      const payload = {
        ...this.form,
      }

      try {
        if (this.isEdit) {
          await trucksService.patch(this.$route.params.id, payload)
        } else {
          await trucksService.create(payload)
        }
      } catch (err) {
        this.$message({
          message: err.message,
          type: 'error',
        })
        return false
      }

      this.$message({
        message: this.isEdit ? 'Грузовик изменен!' : 'Грузовик создан!',
        type: 'success',
      })

      this.$router.push({ name: 'Trucks' })
      return true
    },

    async onBan() {
      try {
        await this.confirmUpdate('Точно хотите заблокировать грузовик?', 'Грузовик не заблокирован')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('trucks').patch(this.$route.params.id, {
        status: 'banned',
      })

      this.$message({
        message: 'Грузовик заблокирован!',
        type: 'success',
      })

      await this.fetchData()
      return true
    },

    async onRestore() {
      try {
        await this.confirmUpdate('Точно хотите разблокировать грузовик?', 'Грузовик не разблокирован')
      } catch (err) {
        return false
      }

      await this.$apiClient.service('trucks').patch(this.$route.params.id, {
        status: 'active',
      })

      this.$message({
        message: 'Грузовик разблокирован!',
        type: 'success',
      })

      await this.fetchData()
      return true
    },

    async onCancel() {
      try {
        await this.confirmUpdate('Отменить изменения?', 'Продолжайте редактирование')
      } catch (err) {
        return false
      }

      this.$router.push({ name: 'Trucks' })
      return true
    },
  },
}
</script>

<style lang="scss" scoped>
.w100 {
  width: 100%;
}

.m-t-2 {
  margin-top: 2rem;
}
</style>
