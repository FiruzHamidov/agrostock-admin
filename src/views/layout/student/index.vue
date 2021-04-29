<template>
  <div id="app">
    <header>
      <img src="@/assets/logo.png" />
      <el-dropdown 
        class="avatar-container" 
        trigger="click">
        <div class="avatar-wrapper">
          <img 
            :src="avatar+'?imageView2/1/w/80/h/80'" 
            class="user-avatar">
          <i class="el-icon-caret-bottom"/>
        </div>
        <el-dropdown-menu 
          slot="dropdown" 
          class="user-dropdown">
          <el-dropdown-item divided>
            <span 
              style="display:block;" 
              @click="logout">Выход</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </header>
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Layout',

  computed: {
    ...mapGetters({
      sidebar: 'sidebar',
      userType: 'user/userType',
    }),

    avatar() {
      return 'https://img.icons8.com/ios/1600/user-male-circle-filled.png'
    },
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('ToggleSideBar')
    },

    async logout() {
      try {
        await this.$store.dispatch('user/logOut')
        location.reload()
      } catch (e) {
        location.reload()
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
header {
  background-color: #448fa7;
  height: 200px;
  width: 100%;
  padding: 0 10%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.avatar-container {
  height: 50px;
  display: inline-block;
  position: absolute;
  right: 35px;
}
.avatar-wrapper {
  cursor: pointer;
  margin-top: 5px;
  position: relative;
  line-height: initial;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
.el-icon-caret-bottom {
  position: absolute;
  right: -20px;
  top: 25px;
  font-size: 12px;
}
.header-title {
  color: white;
  font-size: 24px;
}
.body {
  display: flex;
  align-items: center;
  padding: 100px 5% 0;
}
.body__left {
  width: 50%;
}
.body__right {
  width: 50%;
}
.desc {
  font-size: 36px;
  color: black;
}
button {
  cursor: pointer;
  border: 5px solid #ff5678;
  border-radius: 25px;
  padding: 20px 80px;
  font-size: 36px;
  background: transparent;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
