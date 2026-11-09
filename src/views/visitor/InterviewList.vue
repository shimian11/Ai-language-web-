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

      <!-- 当前栏目列表 -->
      <div v-if="visible.length" class="list">
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
          <!-- 面经显示结果徽标；八股/算法显示难度/频次 -->
          <span class="list-meta">
            <span class="badge" :class="a.resultClass ?? 'ok'">{{ a.result }}</span>
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
import { computed, ref } from 'vue'

import { listPublished } from '@/mocks/articles'
import type { ArticleTopic } from '@/types'

/** 栏目定义 */
const topics: Array<{ key: ArticleTopic; label: string }> = [
  { key: 'exp', label: '面经分享' },
  { key: 'bigu', label: '八股考题' },
  { key: 'algo', label: '算法题' },
]

/** 当前栏目与排序方向 */
const topic = ref<ArticleTopic>('exp')
const sortDir = ref<'desc' | 'asc'>('desc')

/** 面试全量（已发布） */
const all = listPublished('interview')

/** 各栏目数量 */
const countOf = (key: ArticleTopic): number => all.filter((a) => a.topic === key).length

/** 当前栏目 + 排序后的列表 */
const visible = computed(() => {
  const list = all.filter((a) => a.topic === topic.value)
  return sortDir.value === 'asc' ? [...list].reverse() : list
})
</script>
