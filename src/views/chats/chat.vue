<template>
  <div class="chat single-chat">
    <div class="chat__header">
      <div class="chat__info">
        <div class="chat__client">
          <p
            v-for="client in chat.chatClients || []"
            :key="client.id"
            class="chat__client_name"
            @click="openClient(client.id)"
          >
            {{ client.instUsername || '-' }}
          </p>
        </div>
      </div>
    </div>

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
            :key="index + messages.length + 1"
            class="date"
          >
            <p>
              {{ messages[index].createdAt | toDateFormat }}
            </p>
          </div>
          <div
            :key="index"
            :class="{
              message_client: isFirstClient(message.clientId),
              message_operator: !isFirstClient(message.clientId),
              message_system: message.type === 'system',
            }"
            class="message"
          >
            <p class="message__text">{{ message.text }}</p>
            <p class="message__date">{{ message.createdAt | getHours }}</p>

            <img
              :src="require('@/assets/close.svg')"
              alt="delete"
              class="message__delete"
              @click="() => openDeletePopup(message)"
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

export default {
  name: 'Chat',

  components: {
    InfiniteLoading,
    Loading,
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

  props: {
    chat: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  data() {
    return {
      isInitLoading: false,
      isTriggerFirstLoad: false,
      messagesPagination: {
        page: 1,
        total: 100,
        limit: 10,
      },
      messages: [],
    }
  },

  watch: {
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
          const isSmooth = oldVal && val.length !== 0 && val.length - oldVal.length <= 2
          setTimeout(() => this.scrollToBottom(isSmooth), 10)
        }
      },
      deep: true,
    },
  },

  mounted() {
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

    onClose() {
      this.$emit('close')
    },

    onNameClick() {
      this.$emit('on-name-click', this.user.id)
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

    isFirstClient(clientId) {
      return (
        this.chat &&
        this.chat.chatClients &&
        this.chat.chatClients[0] &&
        String(this.chat.chatClients[0].id) === String(clientId)
      )
    },

    openClient(clientId) {
      this.$router.push({ name: 'editClient', params: { id: clientId } })
    },

    async openDeletePopup(message) {
      try {
        const response = await this.$confirm(
          'Вы уверены, что хотите удалить это сообщение?',
          'Внимание',
          {
            confirmButtonText: 'Да',
            cancelButtonText: 'Отменить',
            type: 'error',
          }
        )
        if (response === 'confirm') {
          try {
            await this.$apiClient.service('chats-messages').remove(message.id)
            this.messages = this.messages.filter(item => item.id !== message.id)
            this.messagesPagination = {
              ...this.messagesPagination,
              total: this.messagesPagination.total - 1,
            }
          } catch (e) {
            this.$message({
              message: e.message,
              type: 'error',
            })
          }
        }
      } catch (e) {
        // do nothing
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-color: #fbfbfb;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.04);
  &__header {
    // height: 40px;
    z-index: 111;
  }
  &__navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    padding: 17px 17px 10px;

    .open-list {
      cursor: pointer;
    }
    .edit-buttons {
      display: flex;
      img {
        cursor: pointer;
        width: 30px;
        height: 30px;
        filter: grayscale(1);
        transition: all 0.5s ease;
        &:hover {
          filter: none;
        }
      }
    }
  }
  &__info {
    display: flex;
    justify-content: space-between;
    background-color: white;
    padding: 18px 30px;
    // padding: 0px 17px 10px;
    box-shadow: 0px 4px 5px 0px rgba(black, 0.05);

    color: #343849;
  }
  &__client {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .back {
      z-index: 1000;
      position: absolute;
      right: 0;
      top: 10px;
      cursor: pointer;
      width: 20px;
      height: 20px;
      transition: all 0.3s ease;
      &:hover {
        transform: scale(1.3);
      }
    }
  }
  &__client_online {
    height: 10px;
    width: 10px;
    background-color: #4bc750;
    border-radius: 100%;
    margin-right: 10px;
  }

  &__client_typing {
    $ti-color-bg: white;
    background-color: $ti-color-bg;
    will-change: transform;
    width: auto;
    border-radius: 50px;
    display: table;
    position: relative;
    animation: 2s bulge infinite ease-out;
    &::before,
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: -2px;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background-color: $ti-color-bg;
    }
    &::after {
      height: 10px;
      width: 10px;
      left: -10px;
      bottom: -10px;
    }
    span {
      height: 8px;
      width: 8px;
      float: left;
      margin: 0 1px;
      background-color: #9e9ea1;
      display: block;
      border-radius: 50%;
      opacity: 0.4;
      @for $i from 1 through 3 {
        &:nth-of-type(#{$i}) {
          animation: 1s blink infinite ($i * 0.3333s);
        }
      }
    }
  }

  @keyframes blink {
    50% {
      opacity: 1;
    }
  }
  @keyframes bulge {
    50% {
      transform: scale(1.05);
    }
  }

  &__client_name {
    cursor: pointer;
    margin: 0;
    font-size: 16px;
    text-decoration: underline;
    font-weight: 600;
  }
  &__client_num {
    cursor: pointer;
    font-size: 15px;
    text-decoration: underline;
  }
}
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
      // font-family: 'SF Pro Display Light';
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
  // display: flex;
  // flex-direction: column;
  // margin-top: 15px;
  width: 80%;
  max-width: 350px;
  text-align: left;
  margin-bottom: -2px;
  margin-top: 15px;
  border-radius: 4px;

  &__text {
    font-size: 16px;
    line-height: 19px;
    margin: 4px 0;
    // font-family: 'SF Pro Display Light';
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
    .message__uploads_item {
      justify-content: flex-end;
    }
  }

  &_system {
    width: 100%;
    background-color: #ff8c38;

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

  &__uploads {
    display: flex;
    flex-direction: column;
    &_item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      min-height: 140px;
      max-width: 100%;
      margin-top: 10px;
    }
    &_img {
      max-width: 100%;
    }
  }

  &__delete {
    width: 10px;
    height: 10px;
    position: absolute;
    cursor: pointer;
    top: 4px;
    right: 4px;
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.5;
    }
  }
}

.chat-upload-container {
  position: absolute;
  right: 50px;
  top: 13px;
  z-index: 1;
  cursor: pointer;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  &__icon {
    width: 20px;
    height: 20px;
  }
}
.uploaded-images {
  position: absolute;
  top: -70px;
  left: 0;
  height: 70px;
  width: 100%;
  display: flex;
  flex-direction: row;
  &__item {
    position: relative;
    height: 70px;
    width: 70px;
    margin-right: 10px;

    img {
      height: 100%;
    }

    .delete-icon {
      cursor: pointer;
      position: absolute;
      right: 2px;
      top: 2px;
      width: 10px;
      height: 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
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
</style>
