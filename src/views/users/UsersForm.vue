<template>
  <div class="app-container">
    <el-alert
      v-if="!canManageStaffRoles"
      :closable="false"
      class="role-alert"
      type="warning"
      title="Назначение admin, moderator и superadmin доступно только superadmin. Backend также должен проверять это правило."
      show-icon
    />
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <el-row>
        <el-col :span="11">
          <el-form-item label="E-mail" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
        </el-col>
        <el-col :span="11" :offset="1">
          <el-form-item label="Username" prop="username">
            <el-input v-model="form.username" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="11">
          <el-form-item label="ФИО" prop="fullName">
            <el-input v-model="form.fullName" />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="1">
          <el-form-item label="Язык" prop="languageId">
            <el-input v-model.number="form.languageId" type="number" min="1" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="7">
          <el-form-item label="Роль" prop="type">
            <el-select v-model="form.type" placeholder="Выберите роль">
              <el-option v-for="item in availableTypeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Статус" prop="status">
            <el-select v-model="form.status" placeholder="Выберите статус">
              <el-option
                v-for="item in statusOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="1">
          <el-form-item label="Онлайн" prop="isOnline">
            <el-select v-model="form.isOnline" placeholder="Выберите значение">
              <el-option :value="false" label="Нет" />
              <el-option :value="true" label="Да" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="11">
          <el-form-item
            :label="isEdit ? 'Новый пароль (необязательно)' : 'Пароль'"
            :prop="isEdit ? '' : 'password'"
          >
            <el-input
              v-model="form.password"
              :placeholder="isEdit ? 'Оставьте пустым, чтобы не менять' : ''"
              type="password"
              show-password
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button v-if="isEdit" type="primary" @click="onEdit">Изменить</el-button>
        <el-button v-else type="primary" @click="onAdd">Сохранить</el-button>
        <el-button @click="onCancel">Отмена</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'

export default {
  name: 'UsersForm',

  mixins: [validateForm, confirmUpdate],

  data() {
    const validateUserType = (rule, value, callback) => {
      if (this.availableTypeOptions.includes(value)) {
        callback()
        return
      }

      callback(new Error('Недопустимый тип пользователя'))
    }

    const validateStatus = (rule, value, callback) => {
      if (this.statusOptions.includes(value)) {
        callback()
        return
      }

      callback(new Error('Недопустимый статус'))
    }

    return {
      isEdit: false,
      originalType: '',
      typeOptions: ['company', 'admin', 'moderator', 'superadmin'],
      statusOptions: ['active', 'blocked'],
      form: {
        email: '',
        username: '',
        password: '',
        fullName: '',
        type: 'company',
        status: 'active',
        isOnline: false,
        languageId: 1,
      },
      rules: {
        email: [
          { required: true, message: 'Введите email', trigger: 'blur' },
          { type: 'email', message: 'Некорректный email', trigger: 'blur' },
        ],
        username: [{ required: true, message: 'Введите username', trigger: 'blur' }],
        password: [
          { required: true, message: 'Введите пароль', trigger: 'blur' },
          { min: 6, message: 'Минимум 6 символов', trigger: 'blur' },
        ],
        fullName: [{ required: true, message: 'Введите ФИО', trigger: 'blur' }],
        type: [
          { required: true, message: 'Выберите роль', trigger: 'change' },
          { validator: validateUserType, trigger: 'change' },
        ],
        status: [
          { required: true, message: 'Выберите статус', trigger: 'change' },
          { validator: validateStatus, trigger: 'change' },
        ],
        languageId: [{ required: true, message: 'Укажите язык', trigger: 'blur' }],
      },
    }
  },

  computed: {
    currentUserType() {
      return this.$store.getters['user/userType']
    },

    canManageStaffRoles() {
      return this.currentUserType === 'superadmin'
    },

    availableTypeOptions() {
      if (this.canManageStaffRoles) {
        return this.typeOptions
      }
      return this.originalType && this.originalType !== 'company' ? [this.originalType] : ['company']
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
      this.isEdit = Boolean(this.$route.params.id)

      if (this.isEdit) {
        await this.fetchData()
      } else if (!this.availableTypeOptions.includes(this.form.type)) {
        this.form.type = this.availableTypeOptions[0]
      }
    },

    async fetchData() {
      const data = await this.$apiClient.service('users').get(this.$route.params.id)
      this.form = {
        ...this.form,
        ...data,
        password: '',
      }
      this.originalType = data.type
      if (!this.availableTypeOptions.includes(this.form.type)) {
        this.form.type = this.availableTypeOptions[0]
      }
    },

    buildPayload() {
      const payload = {
        email: this.form.email,
        username: this.form.username,
        fullName: this.form.fullName,
        type: this.form.type,
        status: this.form.status,
        isOnline: Boolean(this.form.isOnline),
        languageId: Number(this.form.languageId),
      }

      if (!this.canManageStaffRoles && this.originalType && this.originalType !== 'company') {
        payload.type = this.originalType
      }

      if (this.form.password) {
        payload.password = this.form.password
      }

      return payload
    },

    showApiError(err, fallbackText) {
      const code = err.code || (err.data && err.data.code)
      let message = err.message || fallbackText

      if (code === 401) {
        message = 'Сессия истекла. Войдите снова'
      } else if (code === 403) {
        message = 'Недостаточно прав для изменения пользователя'
      }

      this.$message({
        message,
        type: 'error',
      })
    },

    async onAdd() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      const payload = this.buildPayload()
      if (!this.availableTypeOptions.includes(payload.type)) {
        this.$message({
          message: 'Недостаточно прав для назначения выбранной роли',
          type: 'error',
        })
        return false
      }

      if (!payload.password) {
        this.$message({
          message: 'Введите пароль',
          type: 'error',
        })
        return false
      }

      try {
        await this.$apiClient.service('users').create(payload)
      } catch (err) {
        this.showApiError(err, 'Не удалось создать пользователя')
        return false
      }

      this.$message({
        message: 'Пользователь создан',
        type: 'success',
      })
      this.$router.push({ name: 'Users' })
      return true
    },

    async onEdit() {
      try {
        await this.validateForm('ruleForm')
      } catch (err) {
        return false
      }

      try {
        await this.confirmUpdate('Сохранить изменения пользователя?', 'Пользователь не изменен')
      } catch (err) {
        return false
      }

      try {
        const payload = this.buildPayload()
        if (!this.availableTypeOptions.includes(payload.type)) {
          this.$message({
            message: 'Недостаточно прав для назначения выбранной роли',
            type: 'error',
          })
          return false
        }
        await this.$apiClient.service('users').update(this.$route.params.id, payload)
      } catch (err) {
        this.showApiError(err, 'Не удалось изменить пользователя')
        return false
      }

      this.$message({
        message: 'Пользователь изменен',
        type: 'success',
      })
      this.$router.push({ name: 'Users' })
      return true
    },

    async onCancel() {
      try {
        await this.confirmUpdate(
          'Отменить изменения пользователя?',
          'Продолжайте редактирование пользователя'
        )
      } catch (err) {
        return false
      }

      this.$router.push({ name: 'Users' })
      return true
    },
  },
}
</script>

<style scoped>
.role-alert {
  margin-bottom: 16px;
}
</style>
