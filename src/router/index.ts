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
      // 首页：四面景深轮播（提示词 / 心得 / 实习 / 面试）
      { path: '', name: 'home', component: () => import('@/views/visitor/HomeFaces.vue') },
      // 提示词：列表 + 详情（详情沿用 entry 数据源）
      { path: 'prompts', name: 'prompts', component: () => import('@/views/visitor/PromptsList.vue') },
      { path: 'prompts/:id', name: 'prompt-detail', component: () => import('@/views/visitor/EntryDetail.vue') },
      // 旧链接兼容：线上已被索引/收藏的 /entry/:id 永久重定向到新路由
      { path: 'entry/:id', redirect: (to) => ({ path: `/prompts/${to.params.id}`, replace: true }) },
      // 心得 / 实习 / 面试：列表 + 详情（P1 走 mock，P3 切真实接口）
      { path: 'notes', name: 'notes', component: () => import('@/views/visitor/NotesList.vue') },
      { path: 'notes/:id', name: 'article-note', component: () => import('@/views/visitor/ArticleDetail.vue') },
      { path: 'internship', name: 'internship', component: () => import('@/views/visitor/InternshipTimeline.vue') },
      { path: 'internship/:id', name: 'article-internship', component: () => import('@/views/visitor/ArticleDetail.vue') },
      { path: 'interview', name: 'interview', component: () => import('@/views/visitor/InterviewList.vue') },
      { path: 'interview/:id', name: 'article-interview', component: () => import('@/views/visitor/ArticleDetail.vue') },
      // 收藏：本地 localStorage，四类 Tab
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
      // 标签即分类后下线大类管理页；旧书签跳转回提示词管理
      { path: 'categories', redirect: { name: 'admin-entry-list' } },
      // 文章管理：心得 / 面试共用列表组件（props 区分类型），实习按公司折叠分组
      {
        path: 'notes',
        name: 'admin-notes',
        component: () => import('@/views/admin/ArticleList.vue'),
        props: { type: 'note' },
      },
      {
        path: 'internship',
        name: 'admin-internship',
        component: () => import('@/views/admin/InternshipManage.vue'),
      },
      {
        path: 'interview',
        name: 'admin-interview',
        component: () => import('@/views/admin/ArticleList.vue'),
        props: { type: 'interview' },
      },
    ],
  },
  // 发布 / 编辑案例：全屏独立页（不带左侧导航栏），避免侧边栏挤压两列布局
  {
    path: '/admin/entries/new',
    name: 'admin-entry-new',
    component: () => import('@/views/admin/EntryEditor.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/entries/:id/edit',
    name: 'admin-entry-edit',
    component: () => import('@/views/admin/EntryEditor.vue'),
    meta: { requiresAuth: true },
  },
  // 文章编辑器：同样全屏独立，字段按 ?type= 自适应
  {
    path: '/admin/articles/new',
    name: 'admin-article-new',
    component: () => import('@/views/admin/ArticleEditor.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/articles/:id/edit',
    name: 'admin-article-edit',
    component: () => import('@/views/admin/ArticleEditor.vue'),
    meta: { requiresAuth: true },
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
