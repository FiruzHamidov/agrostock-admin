<template>
  <div class="app-container deal-form">
    <el-form ref="ruleForm" :rules="rules" :model="form" label-width="160px" label-position="top">
      <div class="border">
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
            <el-button type="success" @click="showDocuments = true"
            >Просмотреть документы</el-button
            >
            <DocumentView :documents="form.documents" :show-documents="showDocuments" />
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
      </div>

      <el-row>
        <el-col :span="12" class="border descr">
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

        <el-col :span="11" :offset="1" class="border">
          <div class="chat single-chat">
            <div class="messages-wrapper">
              <loading :active.sync="isInitLoading" :is-full-page="false" />
              <div ref="messagesWrapper" class="messages">
                <infinite-loading ref="infiniteLoading" direction="top" @infinite="fetchMessages">
                  <span slot="no-more" />
                </infinite-loading>

                <div class="date">
                  <p v-if="messages[0]">{{ messages[0].createdAt | toDateFormat }}</p>
                </div>
                <template v-for="(message, index) in messages">
                  <div
                    v-if="messages[index - 1] && isDisplayTime(index)"
                    :key="message.id"
                    class="date"
                  >
                    <p>
                      {{ messages[index].createdAt | toDateFormat }}
                    </p>
                  </div>
                  <div
                    :key="index"
                    :class="{
                      message_client: isFirstClient(message.companyId),
                      message_operator: !isFirstClient(message.companyId),
                      message_system: message.type === 'system',
                    }"
                    class="message"
                  >
                    <div v-if="message.file" class="message__file">
                      <template v-if="message.file.mimetype.indexOf('image') !== -1">
                        <el-image
                          :src="message.file.path"
                          :preview-src-list="[message.file.path]"
                          alt="file"
                        />
                        <p class="message__file-name">{{ message.file.originalname }}</p>
                      </template>
                      <template v-else>
                        <a :href="message.file.path" target="_blank" rel="noopener noreferrer">{{
                          message.file.originalname
                        }}</a>
                      </template>
                    </div>
                    <p class="message__text">{{ message.text }}</p>
                    <p class="message__date">{{ message.createdAt | getHours }}</p>
                  </div>
                </template>
              </div>
            </div>

            <div class="chat__input flex between">
              <div class="chat__input-file">
                <input ref="uploader" style="display: none;" type="file" @change="onFileAttach" />

                <div
                  v-if="!sendMessage.fileId"
                  class="chat__input-file-attach"
                  @click="onAttachClick"
                >
                  <img :src="require('@/assets/paperclip.svg')" alt="attach" />
                </div>

                <div v-else class="chat__input-file-send" @click="onAttachClick">
                  <img :src="sendMessage.file ? sendMessage.file.path : ''" alt="file" />
                  <p>{{ sendMessage.file ? sendMessage.file.originalname : '-' }}</p>
                </div>
              </div>

              <div class="chat__input-input">
                <el-input
                  v-model="sendMessage.text"
                  placeholder="Сообщение..."
                  @keyup.enter="onSendMessage"
                />
              </div>

              <div class="chat__input-send" @click="onSendMessage">
                <img :src="require('@/assets/send.svg')" alt="send" />
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row class="border">
        <el-col :span="4">
          <el-form-item prop="countryId" label="Страна получения">
            <AsyncSelect
              :value="form.countryId"
              :reduce="val => val.country_id"
              service="countries"
              label="name"
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
              label="name"
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
        <el-button type="danger" plain @click="onDelete">Удалить</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import axios from 'axios'

import validateForm from '@/mixins/validateForm'
import confirmUpdate from '@/mixins/confirmUpdate'
import AsyncSelect from '@/components/AsyncSelect'
import DocumentView from '@/components/DocumentView'

import { batchUnitSizes, currencies, currencySymbols } from '@/utils/variables'

export default {
  name: 'DealsForm',

  components: {
    AsyncSelect,
    InfiniteLoading,
    Loading,
    DocumentView,
  },

  filters: {
    toDateFormat(val) {
      return moment(val).format('DD MMM YYYY')
    },

    getHours(val) {
      return moment(val).format('HH:mm')
    },

    getFullDate(val) {
      return moment(val).format('DD.MM.YY HH:mm')
    },
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
      chat: [],
      isInitLoading: false,
      isTriggerFirstLoad: false,
      messagesPagination: {
        page: 1,
        total: 100,
        limit: 10,
      },
      messages: [],
      sendMessage: {
        text: '',
        fileId: null,
        file: {},
      },
    }
  },

  computed: {
    ...mapGetters({
      token: 'user/token',
    }),
  },

  watch: {
    $route: {
      handler() {
        this.init()
      },
      deep: true,
    },

    'chat.id'() {
      this.messages = []
      this.messagesPagination.page = 1
      this.isTriggerFirstLoad = true
      this.$refs.infiniteLoading.stateChanger.reset()
    },

    messages: {
      handler(val, oldVal) {
        if (
          this.$refs.messagesWrapper &&
          this.$refs.messagesWrapper.scrollHeight - this.$refs.messagesWrapper.scrollTop < 900
        ) {
          const isSmooth = oldVal && val && val.length !== 0 && val.length - oldVal.length <= 2
          setTimeout(() => this.scrollToBottom(isSmooth), 10)
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.init()

    this.isInitLoading = true
    setTimeout(() => {
      this.isInitLoading = false
      this.scrollToBottom()
    }, 800)

    this.$apiClient.service('chats-messages').on('created', message => {
      if (message.chatId === this.chat.id) {
        this.messages.push(message)
      }
    })
  },

  destroyed() {
    this.$apiClient.service('chats-messages').removeListener('created')
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

      const chatRes = await this.$apiClient
        .service('chat-info')
        .find({ query: { companyId: res.buyerId, partnerId: res.sellerId } })
      this.chat = chatRes.chat
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

    async onDelete() {
      try {
        await this.confirmUpdate('Точно удалить сделку?', 'Сделка не удалена')
      } catch (err) {
        return false
      }

      try {
        await this.$apiClient.service('deals').remove(this.$route.params.id)
      } catch (err) {
        this.$message({
          message: err.message,
          type: 'error',
        })
        return false
      }

      this.$message({
        message: 'Сделка удалена!',
        type: 'success',
      })

      this.$router.push({ name: 'Deals' })
      return true
    },

    async addMessages() {
      const messages = await this.$apiClient.service('chats-messages').find({
        query: {
          $limit: this.messagesPagination.limit,
          $skip:
            this.messagesPagination.page - 1 > 0
              ? (this.messagesPagination.page - 1) * this.messagesPagination.limit
              : 0,
          chatId: this.chat.id,
          $sort: {
            createdAt: -1,
          },
        },
      })

      this.messages = [...messages.data.reverse(), ...this.messages]

      this.messagesPagination.page += 1
      this.messagesPagination.total = messages.total
    },

    async fetchMessages($state) {
      if (this.chat.id) {
        await this.addMessages()
      } else {
        $state.complete()
      }

      $state.loaded()
      if (
        this.messagesPagination.total <
        this.messagesPagination.limit * (this.messagesPagination.page - 1)
      ) {
        $state.complete()
      }
    },

    isDisplayTime(index) {
      const message = this.messages[index]
      const nextMessage = this.messages[index - 1]

      if (
        nextMessage &&
        message &&
        !moment(nextMessage.createdAt).isSame(moment(message.createdAt), 'day')
      ) {
        return true
      }

      return false
    },

    scrollToBottom(isSmooth) {
      if (!this.$refs.messagesWrapper) return

      let height = this.$refs.messagesWrapper.scrollTop
      const heightDiff = this.$refs.messagesWrapper.scrollHeight - height
      const range = isSmooth ? heightDiff / 150 : heightDiff / 2
      const interval = setInterval(() => {
        if (this.$refs.messagesWrapper && height < this.$refs.messagesWrapper.scrollHeight) {
          height += range
          this.$refs.messagesWrapper.scrollTop = height
        } else {
          this.$refs.messagesWrapper.scrollTop = this.$refs.messagesWrapper.scrollHeight
          clearInterval(interval)
        }
      }, 5)
    },

    isFirstClient(companyId) {
      return (
        this.chat &&
        this.chat.chatCompanies &&
        this.chat.chatCompanies[0] &&
        String(this.chat.chatCompanies[0].id) === String(companyId)
      )
    },

    onAttachClick() {
      if (this.$refs.uploader) {
        this.$refs.uploader.click()
      }
    },

    async onFileAttach(e) {
      if (!e || !e.target || !e.target.files || !e.target.files[0]) {
        return false
      }

      const file = e.target.files[0]

      try {
        const formData = new FormData()
        formData.append('file', file)

        const { data } = await axios({
          method: 'POST',
          url: `${process.env.FILE_URL}/uploads`,
          data: formData,
          headers: { Authorization: `Bearer ${this.token}` },
        })

        this.sendMessage.fileId = data[0].id
        this.sendMessage.file = data[0]
      } catch (e) {
        // silent upload error to keep old behavior
      }
    },

    async onSendMessage() {
      if (!this.sendMessage.text) {
        return false
      }

      await this.$apiClient.service('chats-messages').create({
        chatId: this.chat.id,
        text: this.sendMessage.text,
        fileId: this.sendMessage.fileId,
      })

      this.sendMessage = {
        text: '',
        fileId: null,
        file: {},
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.border {
  border-radius: 10px;
  box-shadow: 0px 0px 10px 3px rgba(138, 139, 142, 0.5);
  padding: 15px;
  margin-bottom: 30px;
}

.descr {
  padding: 5px 20px;
  height: 37rem;
}

.el-image {
  width: 100%;
  max-height: 150px;

  & > img {
    object-fit: contain;
  }
}

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

.chat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-height: min-content;
  max-height: 35rem;
  min-height: 35rem;
  height: 100%;
  background-color: #fbfbfb;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.04);

  .messages-wrapper {
    height: calc(100% - 30px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .message-input {
      position: relative;
      align-items: unset;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.04);
      padding-bottom: 40px;
      border-bottom: 0px;
      border-right: 0px;
      border-left: 0px;
      input {
        border: 0px;
        padding: 17px 45px 17px 17px;
        font-size: 16px;
        color: #a9a9a9;
        width: 100%;
        outline: none;
        border-bottom: 0;
      }
      .send-button {
        position: absolute;
        right: 16px;
        top: 13px;
        cursor: pointer;
        width: 20px;
        height: 20px;
      }
    }
  }
  .messages {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 0px 16px 32px;

    .date {
      text-align: center;
      font-family: 'SF Pro Display Regular';
      font-size: 15px;
      color: #a9a9a9;
      align-self: center;
      margin-top: 15px;
      &:first-child {
        margin-top: 0px;
      }
    }
  }
  .message {
    position: relative;
    padding: 8px 12px;
    width: 80%;
    max-width: 350px;
    text-align: left;
    margin-bottom: -2px;
    margin-top: 15px;
    border-radius: 4px;

    &__file {
      width: 100%;
      margin-bottom: 5px;
      padding-bottom: 5px;
      border-bottom: 1px dashed black;

      &-name {
        width: 70%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0 15% 5px 15%;
        font-size: 14px;
      }
    }

    &__text {
      font-size: 16px;
      line-height: 19px;
      margin: 4px 0;
    }
    &__date {
      text-align: right;
      font-family: 'SF Pro Display Light';
      font-size: 13px;
      opacity: 0.8;
      margin: 0;
    }

    &_client {
      align-self: flex-start;
      background-color: #eee;

      &__text {
        color: #343849;
      }
      .message__date {
        text-align: right;
        color: #a9a9a9;
      }
    }

    &_operator {
      float: right;
      position: relative;
      align-self: flex-end;
      color: white;
      background-color: #a9a9a9;

      .message__date {
        align-self: flex-end;
      }
    }

    &_system {
      width: 100%;
      background-color: #ff8c38;
      align-self: center;

      &::after {
        display: none;
      }
    }

    &_system &__text {
      font-size: 16px;
      font-family: 'SF Pro Display Regular';
    }
    &_system &__title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;

      &_num {
        cursor: pointer;
        font-family: 'SF Pro Display Light';
        font-size: 15px;
        text-decoration: underline;
      }
      &_created {
        font-family: 'SF Pro Display Thin';
        font-size: 13px;
        opacity: 0.8;
      }
    }
    &_system &__date {
      display: none;
    }
  }

  @media (max-width: 1000px) {
    .chat {
      padding-bottom: 15px;
      &__header {
        height: 40px;
      }
    }
  }

  .chat__input {
    padding: 0 20px;

    &-input {
      flex-basis: 95%;
    }

    &-send {
      margin-left: 5px;
      img {
        cursor: pointer;
        filter: invert(1);
      }
    }

    &-file-attach {
      margin-right: 5px;
      img {
        cursor: pointer;
        filter: grayscale(100%);
      }
    }
  }
}
</style>
