import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    hidden?: boolean
    keepAlive?: boolean
  }
}

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403', hidden: true },
  },
]

// 受保护路由 — 包裹在 AppLayout 中
const protectedRoutes: RouteRecordRaw = {
  path: '/',
  component: () => import('@/components/layout/AppLayout.vue'),
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '首页', icon: 'HomeFilled', requiresAuth: true, keepAlive: true },
    },
    {
      path: 'system',
      name: 'System',
      redirect: '/system/user',
      meta: { title: '系统管理', icon: 'Setting', requiresAuth: true },
      children: [
        {
          path: 'user',
          name: 'SystemUser',
          component: () => import('@/views/system/user/index.vue'),
          meta: { title: '用户管理', icon: 'User', requiresAuth: true, keepAlive: true },
        },
        {
          path: 'dept',
          name: 'SystemDept',
          component: () => import('@/views/system/dept/index.vue'),
          meta: { title: '部门管理', icon: 'OfficeBuilding', requiresAuth: true, keepAlive: true },
        },
        {
          path: 'tag',
          name: 'SystemTag',
          redirect: '/system/tag/risk-clue',
          meta: { title: '分类标签', icon: 'CollectionTag', requiresAuth: true },
          children: [
            {
              path: 'risk-clue',
              name: 'TagRiskClue',
              component: () => import('@/views/system/tag/riskClue.vue'),
              meta: { title: '风险线索标签', requiresAuth: true, keepAlive: true },
            },
            {
              path: 'malicious-skill',
              name: 'TagMaliciousSkill',
              component: () => import('@/views/system/tag/placeholder.vue'),
              meta: { title: '恶意Skill标签', requiresAuth: true },
            },
            {
              path: 'supply-chain',
              redirect: '/system/tag/supply-chain-v2',
            },
            {
              path: 'supply-chain-v2',
              name: 'TagSupplyChainV2',
              component: () => import('@/views/system/tag/supplyChainV2.vue'),
              meta: { title: '供应链标签1.0', requiresAuth: true, keepAlive: true },
            },
          ],
        },
      ],
    },
    {
      path: 'business',
      name: 'Business',
      redirect: '/business/risk-clue',
      meta: { title: '业务中心', icon: 'DataAnalysis', requiresAuth: true },
      children: [
        {
          path: 'risk-clue',
          name: 'BusinessRiskClue',
          component: () => import('@/views/business/riskClue/index.vue'),
          meta: { title: '风险线索库', requiresAuth: true, keepAlive: true },
        },
        {
          path: 'security-event',
          name: 'BusinessSecurityEvent',
          component: () => import('@/views/business/securityEvent/index.vue'),
          meta: { title: '安全事件库', requiresAuth: true, keepAlive: true },
        },
        {
          path: 'risk-report',
          name: 'BusinessRiskReport',
          component: () => import('@/views/business/riskReport/index.vue'),
          meta: { title: '风险报送', requiresAuth: true, keepAlive: true },
        },
        {
          path: 'supply-chain-tag',
          name: 'BusinessSupplyChainTag',
          component: () => import('@/views/business/supplyChainTag/index.vue'),
          meta: { title: '供应链标签', requiresAuth: true, keepAlive: true },
        },
      ],
    },
  ],
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, protectedRoutes],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'AI 安全平台'} - AI 安全事件管理平台`

  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth) {
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
