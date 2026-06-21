<template>
  <div class="app-container">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <el-row>
        <el-col :span="8">
          <el-form-item label="Название" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Номер/гос. знак" prop="number">
            <el-input v-model="form.number" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Статус объявления" prop="status">
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
          <el-form-item label="Марка" prop="brand">
            <el-input v-model="form.brand" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Модель" prop="model">
            <el-input v-model="form.model" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Год" prop="year">
            <el-input v-model="form.year" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Страна" prop="countryId">
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
          <el-form-item label="Город" prop="cityId">
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
          <el-form-item label="Адрес" prop="address">
            <el-input v-model="form.address" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Тип кузова" prop="bodyType">
            <el-input v-model="form.bodyType" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Грузоподъемность (кг)" prop="capacity">
            <el-input v-model="form.capacity" type="number" />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Объем (м3)" prop="volume">
            <el-input v-model="form.volume" type="number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Статус модерации" prop="moderationStatus">
            <el-select v-model="form.moderationStatus" placeholder="Выберите статус" class="w100">
              <el-option label="Ожидает" value="pending" />
              <el-option label="Одобрен" value="approved" />
              <el-option label="Отклонен" value="rejected" />
              <el-option label="Заблокирован" value="banned" />
            </el-select>
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
    const requiredNumber = message => (rule, value, callback) => {
      const number = this.toNumberOrUndefined(value)

      if (number === undefined) {
        callback(new Error(message))
        return
      }

      callback()
    }

    return {
      form: this.getDefaultForm(),
      rules: {
        name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
        number: [{ required: true, message: 'Введите номер/гос. знак', trigger: 'blur' }],
        status: [{ required: true, message: 'Выберите статус объявления', trigger: 'change' }],
        brand: [{ required: true, message: 'Введите марку', trigger: 'blur' }],
        model: [{ required: true, message: 'Введите модель', trigger: 'blur' }],
        year: [{ validator: requiredNumber('Введите год числом'), trigger: 'blur' }],
        countryId: [{ required: true, message: 'Выберите страну', trigger: 'change' }],
        cityId: [{ required: true, message: 'Выберите город', trigger: 'change' }],
        address: [{ required: true, message: 'Введите адрес', trigger: 'blur' }],
        bodyType: [{ required: true, message: 'Введите тип кузова', trigger: 'blur' }],
        capacity: [{ validator: requiredNumber('Введите грузоподъемность числом'), trigger: 'blur' }],
        volume: [{ validator: requiredNumber('Введите объем числом'), trigger: 'blur' }],
        moderationStatus: [{ required: true, message: 'Выберите статус модерации', trigger: 'change' }],
      },
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
        moderationStatus: 'pending',
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
      const truck = res.truck || res.data || res
      const moderation = res.moderation || {}

      this.form = {
        ...this.getDefaultForm(),
        ...truck,
        name: truck.name || truck.title || '',
        number: truck.number || truck.plateNumber || truck.registrationNumber || '',
        brand: truck.brand || truck.make || '',
        model: truck.model || '',
        year: truck.year || truck.manufactureYear || null,
        bodyType: truck.bodyType || truck.body_type || '',
        capacity: truck.capacity || truck.loadCapacity || null,
        volume: truck.volume || truck.cargoVolume || null,
        countryId: truck.countryId || truck.country_id || (truck.country && truck.country.country_id) || null,
        cityId: truck.cityId || truck.city_id || (truck.city && truck.city.city_id) || null,
        moderationStatus: truck.moderationStatus || moderation.status || 'pending',
        moderationComment:
          truck.moderationComment || truck.comment || moderation.comment || moderation.moderationComment || '',
        country: truck.country || {},
        city: truck.city || {},
      }
    },

    async onSave() {
      const trucksService = this.$apiClient.service('trucks')
      const isValid = await this.$refs.ruleForm.validate()

      if (!isValid) return false

      try {
        await this.confirmUpdate(
          this.isEdit ? 'Сохранить изменения грузовика?' : 'Создать грузовик?',
          this.isEdit ? 'Изменения отменены' : 'Создание отменено'
        )
      } catch (err) {
        return false
      }

      const payload = this.getSavePayload()

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

    getSavePayload() {
      const payload = {
        name: this.form.name,
        number: this.form.number,
        brand: this.form.brand,
        model: this.form.model,
        year: this.toNumberOrUndefined(this.form.year),
        bodyType: this.form.bodyType,
        capacity: this.toNumberOrUndefined(this.form.capacity),
        volume: this.toNumberOrUndefined(this.form.volume),
        countryId: this.toNumberOrUndefined(this.form.countryId),
        cityId: this.toNumberOrUndefined(this.form.cityId),
        address: this.form.address,
        status: this.form.status,
        moderationStatus: this.form.moderationStatus,
        moderationComment: this.form.moderationComment,
        comment: this.form.moderationComment,
      }

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key]
        }
      })

      return payload
    },

    toNumberOrUndefined(value) {
      if (value === '' || value === null || value === undefined) return undefined
      const normalizedValue = typeof value === 'string' ? value.replace(',', '.') : value
      const number = Number(normalizedValue)
      return Number.isNaN(number) ? undefined : number
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
