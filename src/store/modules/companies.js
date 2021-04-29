import apiClient from '../../utils/feathers-client'
import userStore from './user'

let id = undefined
const authUser = userStore.state.authUser
const userPermissions = authUser ? authUser.permissions : undefined
if (userPermissions) {
  const permission = userPermissions.find(e => e.split(':*:')[0] === 'companies')
  if (permission) {
    id = permission.split(':*:')[1]
  }
}

const activeCompanyId = authUser && authUser.role === 'company' ? id : undefined
const activePointId = authUser && authUser.role === 'point' ? id : undefined

const companies = {
  namespaced: true,

  state: {
    activeCompanyId,
    availableCompanies: [],
    availablePoints: [],
    activePointId,
  },

  mutations: {
    SET_COMPANY_ID(state, payload) {
      state.activeCompanyId = payload
    },

    SET_POINT_ID(state, payload) {
      state.activePointId = payload
    },

    SET_AVAILABLE_POINTS(state, payload) {
      state.availablePoints = payload
    },
  },

  actions: {
    setCompanyId({ commit, dispatch }, payload) {
      commit('SET_COMPANY_ID', payload)
    },

    setPointId({ commit }, payload) {
      commit('SET_POINT_ID', payload)
    },

    async fetchPointsByCompany({ commit, state }) {
      if (!state.activeCompanyId) {
        return
      }

      const query = {
        companyId: state.activeCompanyId,
        $limit: -1,
      }

      const res = await apiClient.service('points').find({ query })
      commit('SET_AVAILABLE_POINTS', res)
      commit('SET_POINT_ID', undefined)
    },
  },

  getters: {
    activeCompanyId: state => state.activeCompanyId,
    activePointId: state => state.activePointId,
    availablePoints: state => state.availablePoints,
  },
}

export default companies
