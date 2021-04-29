import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
// import { Message } from 'element-ui'
import { getToken } from '@/utils/auth' // 验权
import apiClient from './utils/feathers-client'

function hasPermission(to, from, next) {
  const userType = store.state.user.authUser.role

  if (isAccessible(to, userType)) {
    next()
  } else {
    next({ path: '/401', replace: true, query: { noGoBack: true } })
  }
}

function isAccessible(routeInfo, role) {
  return routeInfo.matched.some(
    m => m.meta.availableRoles && m.meta.availableRoles.indexOf(role) > -1
  )
}

const whiteList = ['/login', '/401', '/404'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (whiteList.indexOf(to.path) > -1) {
    console.log('a?')
    next()
  } else if (store.getters['user/token']) {
    hasPermission(to, from, next)
  } else if (getToken()) {
    apiClient
      .authenticate()
      .then(async res => {
        await store.dispatch('user/setToken', res.accessToken)
        hasPermission(to, from, next)
      })
      .catch(() => {
        next('/login')
      })
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
