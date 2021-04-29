import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import clients from './modules/clients'
import user from './modules/user'
import companies from './modules/companies'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    clients,
    user,
    companies
  },
  getters
})

export default store
