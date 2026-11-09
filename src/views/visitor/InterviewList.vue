<template>
  <!-- 面试列表：三栏目（面经分享 / 八股考题 / 算法题）+ 排序 -->
  <div class="visitor-page">
    <main class="container-v page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span><b>面试</b>
      </div>

      <div class="page-head">
        <div class="kicker">Interview Review</div>
        <h1 class="page-title">面试</h1>
        <p class="page-desc">
          三个栏目：看别人的面经学思路，把高频八股整理成清单，把算法题写成可复用的解法。公司名脱敏，题目不打码。
        </p>
      </div>

      <div class="toolbar">
        <div class="tabs" role="tablist">
          <button
            v-for="t in topics"
            :key="t.key"
            type="button"
            role="tab"
            :class="{ on: topic === t.key }"
            :aria-selected="topic === t.key ? 'true' : 'false'"
            @click="topic = t.key"
          >
            {{ t.label }} <span class="chip-count">{{ countOf(t.key) }}</span>
          </button>
        </div>
        <div class="spacer"></div>
        <!-- 排序：按日期正/倒序 -->
        <div class="tabs">
          <button type="button" :class="{ on: sortDir === 'desc' }" @click="sortDir = 'desc'">
            最新优先
          </button>
          <button type="button" :class="{ on: sortDir === 'asc' }" @click="sortDir = 'asc'">
            最早优先
          </button>
        </div>
      </div>

      <!-- 加载态 / 错误态 -->
      <div v-if="loading" class="empty"><p>正在加载…</p></div>
      <div v-else-if="error" class="empty">
        <p>{{ error }}</p>
        <button class="btn" type="button" @click="load">重新加载</button>
      </div>

      <!-- 当前栏目列表 -->
      <div v-else-if="visible.length" class="list">
        <RouterLink
          v-for="a in visible"
          :key="a.id"
          class="list-item"
          :to="`/interview/${a.id}`"
        >
          <span class="list-date">{{ a.date }}</span>
          <span>
            <span class="list-title">{{ a.title }}</span>
            <span class="list-desc">{{ a.summary }}</span>
          </span>
          <!-- 结果徽标：面经显示通过/未通过；八股/算法显示难度或频次 -->
          <span class="list-meta">
            <span v-if="a.result" class="badge" :class="a.resultClass || 'ok'">{{ a.result }}</span>
          </span>
        </RouterLink>
      </div>
      <div v-else class="empty">
        <p>这个栏目还没有已发布的内容。</p>
        <RouterLink class="btn primary" to="/notes">去心得栏目看看 →</RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { listPublishedArticles } from '@/api/article'
import type { Article, ArticleTopic } from '@/types'

/** 栏目定义 */
const topics: Array<{ key: ArticleTopic; label: string }> = [
  { key: 'exp', label: '面经分享' },
  { key: 'bigu', label: '八股考题' },
  { key: 'algo', label: '算法题' },
]

/** 当前栏目与排序方向 */
const topic = ref<ArticleTopic>('exp')
const sortDir = ref<'desc' | 'asc'>('desc')

/** 已发布面试内容（后端按展示日期倒序返回） */
const all = ref<Article[]>([])
const loading = ref(true)
const error = ref('')

/** 拉取已发布面试内容 */
async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    all.value = await listPublishedArticles('interview')
  } catch {
    error.value = '内容加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

/** 各栏目数量 */
const countOf = (key: ArticleTopic): number => all.value.filter((a) => a.topic === key).length

/** 当前栏目 + 排序后的列表 */
const visible = computed(() => {
  const list = all.value.filter((a) => a.topic === topic.value)
  return sortDir.value === 'asc' ? [...list].reverse() : list
})

onMounted(load)
</script>
