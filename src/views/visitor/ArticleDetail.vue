<template>
  <!-- 文章详情：心得 / 实习 / 面试 三类共用（按路由名区分类型） -->
  <div class="visitor-page">
    <main class="container-v narrow page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span>
        <RouterLink :to="listPath">{{ label }}</RouterLink><span>/</span>
        <b>{{ article?.title ?? '文章' }}</b>
      </div>

      <div v-if="loading" class="empty"><p>正在加载…</p></div>

      <template v-else-if="article">
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
            <span v-if="article.result" class="badge" :class="article.resultClass || 'ok'">
              {{ article.result }}
            </span>
          </div>
          <div class="tags">
            <span v-for="t in article.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>

        <!-- 正文：后端存 Markdown，前端渲染（内容为管理员本人录入的可信内容） -->
        <!-- eslint-disable-next-line vue/no-v-html -- 博客正文渲染的必要手段 -->
        <article class="article-body" v-html="bodyHtml"></article>

        <!-- 上一篇 / 下一篇 -->
        <div class="pager">
          <RouterLink class="btn" :to="`${listPath}/${prev?.id ?? article.id}`">← 上一篇</RouterLink>
          <RouterLink class="btn" :to="`${listPath}/${next?.id ?? article.id}`">下一篇 →</RouterLink>
        </div>
      </template>

      <div v-else class="empty">
        <p>{{ error || '文章不存在或尚未发布。' }}</p>
        <RouterLink class="btn primary" :to="listPath">← 返回{{ label }}列表</RouterLink>
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

import { getArticleDetail, listPublishedArticles } from '@/api/article'
import { useFavorites } from '@/composables/useFavorites'
import { ARTICLE_TYPE_META } from '@/config/article'
import { renderMarkdown } from '@/utils/markdown'
import type { Article, ArticleType } from '@/types'

const route = useRoute()
const { has, toggle } = useFavorites()

/** 由路由名推导文章类型 */
const type = computed<ArticleType>(() => {
  if (route.name === 'article-internship') return 'internship'
  if (route.name === 'article-interview') return 'interview'
  return 'note'
})

/** 类型显示名与列表路由（列表路由是复数：/notes、/internship、/interview） */
const meta = computed(() => ARTICLE_TYPE_META[type.value])
const label = computed(() => meta.value.label)
const listPath = computed(() => meta.value.listPath)

/** 当前文章 / 同类型已发布列表（用于上一篇下一篇） */
const article = ref<Article | null>(null)
const siblings = ref<Article[]>([])
const loading = ref(true)
const error = ref('')

/** 正文 HTML：Markdown → HTML */
const bodyHtml = computed(() => renderMarkdown(article.value?.body))

/** 拉取详情与同类型已发布列表 */
async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  article.value = null
  try {
    const id = String(route.params.id)
    const [detail, list] = await Promise.all([
      getArticleDetail(id),
      listPublishedArticles(type.value),
    ])
    article.value = detail
    siblings.value = list
  } catch (e) {
    // 后端对「不存在/未发布」返回业务错误，这里统一展示空态
    error.value = e instanceof Error ? e.message : '文章加载失败'
  } finally {
    loading.value = false
  }
}

/** 收藏状态与切换 */
const faved = computed(() =>
  article.value ? has(type.value, String(article.value.id)) : false,
)
function onFav(): void {
  if (!article.value) return
  const a = article.value
  const added = toggle({
    type: type.value,
    id: String(a.id),
    title: a.title,
    cat: a.sub,
    desc: a.summary,
    cover: a.cover || undefined,
  })
  showToast(added ? '已收藏，可在收藏页查看' : '已取消收藏')
}

/** 上一篇 / 下一篇（同类型已发布内按日期环形轮转） */
const prev = computed(() => {
  const list = siblings.value
  if (!list.length || !article.value) return null
  const i = list.findIndex((a) => a.id === article.value?.id)
  if (i < 0) return null
  return list[(i - 1 + list.length) % list.length] ?? null
})
const next = computed(() => {
  const list = siblings.value
  if (!list.length || !article.value) return null
  const i = list.findIndex((a) => a.id === article.value?.id)
  if (i < 0) return null
  return list[(i + 1) % list.length] ?? null
})

/* 路由参数变化（上一篇/下一篇跳转）时重新取文章 */
watch(
  () => [type.value, route.params.id],
  () => {
    load()
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

// 首次进入即加载（路由参数变化由 watch 负责）
load()
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
