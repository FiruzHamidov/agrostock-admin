const clients = {
  namespaced: true,

  state: {
    activeClientId: undefined,
  },

  mutations: {
    SET_CLIENT_ID (state, payload) {
      state.activeClientId = payload
    }
  },

  actions: {
    setClientId ({ commit }, payload) {
      commit('SET_CLIENT_ID', payload)
    }
  },

  getters: {
    activeClientId:  state => state.activeClientId
  }
}

export default clients