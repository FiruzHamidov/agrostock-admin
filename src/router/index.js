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
  { path: '/403', component: () => import('@/views/403'), hidden: true },

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
        path: 'read/:id',
        name: 'readCategory',
        hidden: true,
        component: () => import('@/views/categories/CategoryRead'),
        meta: {
          title: 'Просмотр категории',
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
        path: 'read/:id',
        name: 'readNews',
        hidden: true,
        component: () => import('@/views/news/NewsRead'),
        meta: {
          title: 'Просмотр новости',
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
        path: 'add',
        name: 'addTender',
        hidden: true,
        component: () => import('@/views/tenders/TendersForm'),
        meta: {
          title: 'Добавление торгов',
          icon: 'tenders',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readTender',
        hidden: true,
        component: () => import('@/views/tenders/TenderRead'),
        meta: {
          title: 'Просмотр торгов',
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
        path: 'add',
        name: 'addDeals',
        hidden: true,
        component: () => import('@/views/deals/DealCreate'),
        meta: {
          title: 'Добавление сделки',
          icon: 'deals',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readDeals',
        hidden: true,
        component: () => import('@/views/deals/DealRead'),
        meta: {
          title: 'Просмотр сделки',
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
    hidden: true,
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
      {
        path: 'read/:id',
        name: 'readArbitrations',
        hidden: true,
        component: () => import('@/views/arbitration/ArbitrationRead'),
        meta: {
          title: 'Просмотр арбитража',
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
        path: 'add',
        name: 'addProducts',
        hidden: true,
        component: () => import('@/views/products/ProductsForm'),
        meta: {
          title: 'Добавление товара',
          icon: 'products',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readProducts',
        hidden: true,
        component: () => import('@/views/products/ProductRead'),
        meta: {
          title: 'Просмотр товара',
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
    path: '/trucks',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Trucks',
        component: () => import('@/views/trucks/index'),
        meta: {
          title: 'Грузовики',
          icon: 'products',
          roles: ['admin'],
        },
      },
      {
        path: 'add',
        name: 'addTruck',
        hidden: true,
        component: () => import('@/views/trucks/TrucksForm'),
        meta: {
          title: 'Добавление грузовика',
          icon: 'products',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readTruck',
        hidden: true,
        component: () => import('@/views/trucks/TruckRead'),
        meta: {
          title: 'Просмотр грузовика',
          icon: 'products',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editTruck',
        hidden: true,
        component: () => import('@/views/trucks/TrucksForm'),
        meta: {
          title: 'Грузовик',
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
        path: 'add',
        name: 'addCompanies',
        hidden: true,
        component: () => import('@/views/companies/CompaniesForm'),
        meta: {
          title: 'Добавление компании',
          icon: 'companies',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readCompanies',
        hidden: true,
        component: () => import('@/views/companies/CompanyRead'),
        meta: {
          title: 'Просмотр компании',
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
      {
        path: 'read/:id',
        name: 'readTendersReport',
        hidden: true,
        component: () => import('@/views/tenders-reports/TendersReportRead'),
        meta: {
          title: 'Просмотр жалобы на торги',
          icon: 'complaint',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editTendersReport',
        hidden: true,
        component: () => import('@/views/tenders-reports/TendersReportForm'),
        meta: {
          title: 'Редактирование жалобы на торги',
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
      {
        path: 'read/:id',
        name: 'readProductsReport',
        hidden: true,
        component: () => import('@/views/products-reports/ProductsReportRead'),
        meta: {
          title: 'Просмотр жалобы на товар',
          icon: 'complaint',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editProductsReport',
        hidden: true,
        component: () => import('@/views/products-reports/ProductsReportForm'),
        meta: {
          title: 'Редактирование жалобы на товар',
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
    path: '/truck-moderation',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'TruckModeration',
        component: () => import('@/views/truck-moderation/index'),
        meta: {
          title: 'Модерация грузовиков',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
      {
        path: 'add',
        name: 'addTruckModeration',
        hidden: true,
        component: () => import('@/views/truck-moderation/TruckModerationForm'),
        meta: {
          title: 'Добавление модерации грузовика',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readTruckModeration',
        hidden: true,
        component: () => import('@/views/truck-moderation/TruckModerationRead'),
        meta: {
          title: 'Просмотр модерации грузовика',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editTruckModeration',
        hidden: true,
        component: () => import('@/views/truck-moderation/TruckModerationForm'),
        meta: {
          title: 'Редактирование модерации грузовика',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin', 'moderator', 'superadmin'],
    },
  },

  {
    path: '/product-moderation',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'ProductModeration',
        component: () => import('@/views/products/ProductModeration'),
        meta: {
          title: 'Модерация товаров',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
      {
        path: 'add',
        name: 'addProductModeration',
        hidden: true,
        component: () => import('@/views/products/ProductModerationForm'),
        meta: {
          title: 'Добавление модерации товара',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readProductModeration',
        hidden: true,
        component: () => import('@/views/products/ProductModerationRead'),
        meta: {
          title: 'Просмотр модерации товара',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editProductModeration',
        hidden: true,
        component: () => import('@/views/products/ProductModerationForm'),
        meta: {
          title: 'Редактирование модерации товара',
          icon: 'complaint',
          roles: ['admin', 'moderator', 'superadmin'],
        },
      },
    ],
    meta: {
      availableRoles: ['admin', 'moderator', 'superadmin'],
    },
  },

  {
    path: '/admin/chats',
    component: Layout,
    redirect: '/admin/chats',
    children: [
      {
        path: '',
        name: 'AdminChatsAll',
        component: () => import('@/views/chats-moderation/AllChats'),
        meta: {
          title: 'Все чаты',
          icon: 'chat',
        },
      },
      {
        path: 'common',
        name: 'AdminChatsCommon',
        component: () => import('@/views/chats-moderation/CommonChats'),
        meta: {
          title: 'Общий и категории',
          icon: 'chat',
        },
      },
      {
        path: 'moderation',
        name: 'AdminChatsModerationLog',
        component: () => import('@/views/chats-moderation/ModerationLog'),
        meta: {
          title: 'Лог модерации',
          icon: 'chat',
        },
      },
      {
        path: 'blocked-words',
        name: 'AdminChatsBlockedWords',
        component: () => import('@/views/chats-moderation/BlockedWords'),
        meta: {
          title: 'Стоп-слова',
          icon: 'chat',
        },
      },
      {
        path: ':id',
        name: 'AdminChatsDetails',
        hidden: true,
        component: () => import('@/views/chats-moderation/ChatDetails'),
        meta: {
          title: 'Детали чата',
          icon: 'chat',
        },
      },
    ],
    meta: {
      title: 'Чаты',
      icon: 'chat',
      availableRoles: ['admin', 'moderator', 'superadmin'],
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
      {
        path: 'add',
        name: 'addUser',
        hidden: true,
        component: () => import('@/views/users/UsersForm'),
        meta: {
          title: 'Добавление пользователя',
          icon: 'users',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readUser',
        hidden: true,
        component: () => import('@/views/users/UserRead'),
        meta: {
          title: 'Просмотр пользователя',
          icon: 'users',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editUser',
        hidden: true,
        component: () => import('@/views/users/UsersForm'),
        meta: {
          title: 'Редактирование пользователя',
          icon: 'users',
          roles: ['admin'],
        },
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
      {
        path: 'add',
        name: 'addTransaction',
        hidden: true,
        component: () => import('@/views/transactions/TransactionForm'),
        meta: {
          title: 'Добавление транзакции',
          icon: 'transactions',
          roles: ['admin'],
        },
      },
      {
        path: 'read/:id',
        name: 'readTransaction',
        hidden: true,
        component: () => import('@/views/transactions/TransactionRead'),
        meta: {
          title: 'Просмотр транзакции',
          icon: 'transactions',
          roles: ['admin'],
        },
      },
      {
        path: 'edit/:id',
        name: 'editTransaction',
        hidden: true,
        component: () => import('@/views/transactions/TransactionForm'),
        meta: {
          title: 'Редактирование транзакции',
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
