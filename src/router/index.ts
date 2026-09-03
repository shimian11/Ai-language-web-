import { createRouter, createWebHistory } from 'vue-router'

import { getToken } from '@/utils/auth'

import type { RouteRecordRaw } from 'vue-router'

// 仅开发环境注册的组件演示页
const devRoutes: RouteRecordRaw[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/components',
        name: 'dev-components',
        component: () => import('@/views/dev/ComponentsDemo.vue'),
      },
    ]
  : []

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/VisitorLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/visitor/Home.vue') },
      { path: 'entry/:id', name: 'entry-detail', component: () => import('@/views/visitor/EntryDetail.vue') },
      { path: 'favorites', name: 'favorites', component: () => import('@/views/visitor/Favorites.vue') },
    ],
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/Login.vue'),
  },
  ...devRoutes,
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'entries', name: 'admin-entry-list', component: () => import('@/views/admin/EntryList.vue') },
      { path: 'entries/new', name: 'admin-entry-new', component: () => import('@/views/admin/EntryEditor.vue') },
      {
        path: 'entries/:id/edit',
        name: 'admin-entry-edit',
        component: () => import('@/views/admin/EntryEditor.vue'),
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/CategoryManage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !getToken()) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
})

export default router
