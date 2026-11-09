<template>
  <!-- 文章详情：心得 / 实习 / 面试 三类共用（按路由名区分类型） -->
  <div class="visitor-page">
    <main class="container-v narrow page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span>
        <RouterLink :to="`/${type}`">{{ label }}</RouterLink><span>/</span>
        <b>{{ article?.title ?? '文章' }}</b>
      </div>

      <template v-if="article">
        <div class="article-head">
          <div class="kicker">{{ article.sub }}</div>
          <!-- 标题 + 收藏按钮同行 -->
          <div class="title-row">
            <h1 class="article-title">{{ article.title }}</h1>
            <button class="fav-btn" :class="{ on: faved }" type="button" @click="onFav">
              <span class="star">{{ faved ? '★' : '☆' }}</span>
              <span>{{ faved ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
          <div class="article-meta">
            <span>{{ article.date }}</span>
            <span>{{ article.read }}</span>
            <span v-if="article.result" class="badge" :class="article.resultClass">
              {{ article.result }}
            </span>
          </div>
          <div class="tags">
            <span v-for="t in article.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>

        <!-- 正文：P1 为 mock 预渲染 HTML；P3 后端为 Markdown，此处换渲染器 -->
        <!-- eslint-disable-next-line vue/no-v-html -- 正文为本人后台录入的可信内容（非用户输入），v-html 是博客渲染的必要手段 -->
        <article class="article-body" v-html="article.body"></article>

        <!-- 上一篇 / 下一篇 -->
        <div class="pager">
          <RouterLink class="btn" :to="`/${type}/${prev?.id ?? article.id}`">← 上一篇</RouterLink>
          <RouterLink class="btn" :to="`/${type}/${next?.id ?? article.id}`">下一篇 →</RouterLink>
        </div>
      </template>

      <div v-else class="empty">
        <p>文章不存在或尚未发布。</p>
        <RouterLink class="btn primary" :to="`/${type}`">← 返回{{ label }}列表</RouterLink>
      </div>
    </main>

    <!-- 轻量 Toast（收藏反馈） -->
    <Teleport to="body">
      <div class="v-toast" :class="{ show: toastShow }">{{ toast }}</div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getArticle, listPublished } from '@/mocks/articles'
import { useFavorites } from '@/composables/useFavorites'
import type { ArticleType } from '@/types'

const route = useRoute()
const { has, toggle } = useFavorites()

/** 由路由名推导文章类型 */
const type = computed<ArticleType>(() => {
  if (route.name === 'article-internship') return 'internship'
  if (route.name === 'article-interview') return 'interview'
  return 'note'
})

/** 类型显示名（面包屑/空态） */
const label = computed(() => ({ note: '心得', internship: '实习', interview: '面试' })[type.value])

/** 当前文章（mock；P3 切接口） */
const article = ref(getArticle(type.value, String(route.params.id)))

/** 收藏状态与切换 */
const faved = computed(() => has(type.value, String(route.params.id)))
function onFav(): void {
  if (!article.value) return
  const a = article.value
  const added = toggle({
    type: type.value,
    id: String(a.id),
    title: a.title,
    cat: a.sub,
    desc: a.summary,
  })
  showToast(added ? '已收藏，可在收藏页查看' : '已取消收藏')
}

/** 上一篇 / 下一篇（同类型内按日期环形轮转） */
const siblings = computed(() => listPublished(type.value))
const prev = computed(() => {
  const list = siblings.value
  if (!list.length || !article.value) return null
  const i = list.findIndex((a) => a.id === article.value?.id)
  return list[(i - 1 + list.length) % list.length] ?? null
})
const next = computed(() => {
  const list = siblings.value
  if (!list.length || !article.value) return null
  const i = list.findIndex((a) => a.id === article.value?.id)
  return list[(i + 1) % list.length] ?? null
})

/* 路由参数变化（上一篇/下一篇跳转）时重新取文章 */
watch(
  () => [type.value, route.params.id],
  () => {
    article.value = getArticle(type.value, String(route.params.id))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  },
)

/* ---------- 轻量 Toast ---------- */
const toast = ref('')
const toastShow = ref(false)
let timer: number | undefined
function showToast(text: string): void {
  toast.value = text
  toastShow.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => (toastShow.value = false), 1400)
}
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.title-row .article-title {
  flex: 1;
  min-width: 0;
}
.title-row .fav-btn {
  flex: 0 0 auto;
  margin-top: 12px;
}
.pager {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}
</style>
