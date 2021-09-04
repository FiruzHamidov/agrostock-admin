import Vue from 'vue'
import Router from 'vue-router'
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/

export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },

  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'Статистика', icon: 'dashboard' },
      },
    ],
    meta: {
      availableRoles: ['admin', 'company', 'university'],
    },
  },

  {
    path: '/categories',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Categories',
        component: () => import('@/views/categories/index'),
        meta: {
          title: 'Категории',
          icon: 'categories',
          roles: ['admin'],
        },
      },
      {
        path: 'add',
        name: 'addCategory',
        hidden: true,
        component: () => import('@/views/categories/CategoryForm'),
        meta: {
          title: 'Добавление категории',
          icon: 'categories',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editCategory',
        hidden: true,
        component: () => import('@/views/categories/CategoryForm'),
        meta: {
          title: 'Изменение категории',
          icon: 'categories',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/news',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'News',
        component: () => import('@/views/news/index'),
        meta: {
          title: 'Новости',
          icon: 'news',
          roles: ['admin'],
        },
      },
      {
        path: 'add',
        name: 'addNews',
        hidden: true,
        component: () => import('@/views/news/NewsForm'),
        meta: {
          title: 'Добавление новости',
          icon: 'news',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editNews',
        hidden: true,
        component: () => import('@/views/news/NewsForm'),
        meta: {
          title: 'Изменение новости',
          icon: 'news',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/tenders',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Tenders',
        component: () => import('@/views/tenders/index'),
        meta: {
          title: 'Торги',
          icon: 'tenders',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editTender',
        hidden: true,
        component: () => import('@/views/tenders/TendersForm'),
        meta: {
          title: 'Изменение торгов',
          icon: 'tenders',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/deals',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Deals',
        component: () => import('@/views/deals/index'),
        meta: {
          title: 'Сделки',
          icon: 'deals',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editDeals',
        hidden: true,
        component: () => import('@/views/deals/DealForm'),
        meta: {
          title: 'Сделка',
          icon: 'deals',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/arbitrations',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Arbitrations',
        component: () => import('@/views/arbitration/index'),
        meta: {
          title: 'Арбитражи',
          icon: 'arbitrations',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editArbitrations',
        hidden: true,
        component: () => import('@/views/arbitration/ArbitrationForm'),
        meta: {
          title: 'Арбитраж',
          icon: 'arbitrations',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/products',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Products',
        component: () => import('@/views/products/index'),
        meta: {
          title: 'Товары',
          icon: 'products',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editProducts',
        hidden: true,
        component: () => import('@/views/products/ProductsForm'),
        meta: {
          title: 'Товар',
          icon: 'products',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/companies',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Companies',
        component: () => import('@/views/companies/index'),
        meta: {
          title: 'Компании',
          icon: 'companies',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editCompanies',
        hidden: true,
        component: () => import('@/views/companies/CompaniesForm'),
        meta: {
          title: 'Компания',
          icon: 'companies',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/tenders-reports',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'TendersReports',
        component: () => import('@/views/tenders-reports/index'),
        meta: {
          title: 'Жалобы на торги',
          icon: 'complaint',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/products-reports',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'ProductsReports',
        component: () => import('@/views/products-reports/index'),
        meta: {
          title: 'Жалобы на товар',
          icon: 'complaint',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/chats',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Chats',
        component: () => import('@/views/chats/index'),
        meta: {
          title: 'Чаты клиентов',
          icon: 'chat',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/users/',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Users',
        component: () => import('@/views/users/index'),
        meta: { title: 'Пользователи', icon: 'users' },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  {
    path: '/transactions',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Transactions',
        component: () => import('@/views/transactions/index'),
        meta: {
          title: 'Транзакции',
          icon: 'transactions',
          roles: ['admin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin'],
    },
  },

  { path: '*', redirect: '/404', hidden: true },
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap,
})
