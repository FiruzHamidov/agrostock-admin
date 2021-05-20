<template>
  <div class="app-container">
    <div
      class="top-menu el-col el-col-24 el-col-xs-24 el-col-sm-24 el-col-md-24 tp-text--right mb-4"
    >
      <div class="filters">
        <el-input v-model="filters.search" placeholder="Поиск" />
        <el-button @click="onFilterClick">
          Применить
        </el-button>
      </div>

      <div class="add-button" />
    </div>

    <div class="chats-container">
      <div class="list infinite-wrapper">
        <div
          v-for="chat in chats"
          :key="chat.id"
          :class="{ 'list-item': true, active: chat.id === selectedChat.id }"
          @click="selectChat(chat)"
        >
          <div class="list-item__name">
            <div
              v-for="(client, index) in chat.chatClients"
              :key="client.id"
              :class="{
                'list-item__chat-user': true,
                'list-item__chat-user--left': index === 0,
                'list-item__chat-user--right': index === 1,
              }"
            >
              <img
                :src="client.photo ? client.photo.path : require('@/assets/userpic.png')"
                alt="img"
                class="list-item__chat-user__ava"
              >
              <div class="list-item__chat-user__name">{{ client.instUsername }}</div>
            </div>
            <!-- <p v-for="client in chat.chatClients" :key="client.id">{{ client.instUsername }}</p> -->
          </div>
          <p v-if="chat.lastMessage" class="list-item__last-message">
            Последнее сообщение: {{ chat.lastMessage.text }}
          </p>
        </div>
        <infinite-loading ref="chatsInfiniteLoading" direction="bottom" @infinite="fetchChats">
          <span slot="no-more" />
        </infinite-loading>
      </div>

      <div class="active-chat">
        <Chat v-if="!!selectedChat.id" :chat="selectedChat" />
      </div>
    </div>
  </div>
</template>

<script>
import Chat from './chat'
import InfiniteLoading from 'vue-infinite-loading'
import confirmUpdate from '@/mixins/confirmUpdate'

export default {
  name: 'Chats',

  components: {
    InfiniteLoading,
    Chat,
  },

  mixins: [confirmUpdate],

  data() {
    return {
      chats: [],
      selectedChat: {},
      filters: {},
      isLoading: true,
      total: 1,
      limit: 10,
      page: 1,
    }
  },

  mounted() {
    this.fetchChats()
  },

  methods: {
    async fetchChats($state) {
      this.isLoading = true
      const query = {
        $limit: this.limit,
        $skip: this.page - 1 ? (this.page - 1) * this.limit : 0,
        $sort: {
          updatedAt: -1,
        },
      }

      Object.keys(this.filters).forEach(key => {
        if (this.filters[key]) {
          query[key] = this.filters[key]
        }
      })
      const response = await this.$apiClient.service('chats').find({
        query,
      })

      const { data, total } = response

      this.chats = data
      this.total = total
      this.page += 1

      this.isLoading = false

      if ($state) {
        $state.loaded()
        if (this.total < this.limit * (this.page - 1)) {
          $state.complete()
        }
      }
      return true
    },

    selectChat(c) {
      this.selectedChat = c
    },

    onFilterClick() {
      this.page = 1
      this.$refs.chatsInfiniteLoading.stateChanger.reset()
      this.fetchChats()
    },
  },
}
</script>

<style lang="scss" scoped>
.chats-container {
  display: flex;
  width: 100%;
  height: 80vh;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0px 0px 5px 5px #f7f7f7;

  .list {
    height: 100%;
    width: 30%;
    overflow-y: auto;
    border-right: 1px solid #efeff4;
    padding: 20px 0;

    .list-item {
      display: flex;
      flex-direction: column;
      text-align: center;
      padding: 12px 26px;
      border-top: 1px solid transparent;
      border-bottom: 1px solid transparent;
      border-left: 1px solid transparent;
      transition: all 0.4s ease;
      cursor: pointer;

      &:not(:last-child) {
        border-bottom: 1px solid #efeff4;
      }

      &__name {
        display: flex;
        justify-content: space-between;
      }
      &.active {
        border-color: #efeff4;
        background-color: #409eff;
        cursor: auto;
        color: white;
      }
      &__last-message {
        margin: 6px 0 0 0;
        font-size: 13px;
        opacity: 0.8;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &__chat-user {
        display: flex;
        flex-direction: column;
        max-width: 48%;
        &__ava {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin-bottom: 10px;
        }
        &__name {
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &--left {
          margin-right: 1%;
        }
        &--right {
          margin-left: 1%;
          .list-item__chat-user {
            &__ava {
              align-self: flex-end;
            }
          }
        }
      }
    }
  }
  .active-chat {
    width: 70%;
    height: 100%;
  }
}
</style>
