<template>
  <!-- 心得列表：三栏目（项目实战 / AI 使用 / 学习方法）+ 排序 -->
  <div class="visitor-page">
    <main class="container-v page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span><b>心得</b>
      </div>

      <div class="page-head">
        <div class="kicker">Notes &amp; Thoughts</div>
        <h1 class="page-title">心得</h1>
        <p class="page-desc">
          三个栏目：做项目踩的坑、用 AI 的真实体会、以及学习方法。写给三年前的自己，也写给正在路上的你。
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
        <!-- 排序：按日期正/倒序（栏目列表内排序） -->
        <div class="tabs">
          <button type="button" :class="{ on: sortDir === 'desc' }" @click="sortDir = 'desc'">
            最新优先
          </button>
          <button type="button" :class="{ on: sortDir === 'asc' }" @click="sortDir = 'asc'">
            最早优先
          </button>
        </div>
      </div>

      <!-- 当前栏目列表（已发布） -->
      <div v-if="visible.length" class="list">
        <RouterLink
          v-for="a in visible"
          :key="a.id"
          class="list-item"
          :to="`/notes/${a.id}`"
        >
          <span class="list-date">{{ a.date }}</span>
          <span>
            <span class="list-title">{{ a.title }}</span>
            <span class="list-desc">{{ a.summary }}</span>
          </span>
          <span class="list-meta">{{ a.read }}</span>
        </RouterLink>
      </div>
      <div v-else class="empty">
        <p>这个栏目还没有已发布的内容。</p>
        <RouterLink class="btn primary" to="/interview">去面试栏目看看 →</RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { listPublished } from '@/mocks/articles'
import type { ArticleTopic } from '@/types'

/** 栏目定义（key 与 article.topic 对应） */
const topics: Array<{ key: ArticleTopic; label: string }> = [
  { key: 'proj', label: '项目实战' },
  { key: 'ai', label: 'AI 使用' },
  { key: 'learn', label: '学习方法' },
]

/** 当前栏目与排序方向 */
const topic = ref<ArticleTopic>('proj')
const sortDir = ref<'desc' | 'asc'>('desc')

/** 心得全量（已发布），栏目计数用 */
const all = listPublished('note')

/** 各栏目数量 */
const countOf = (key: ArticleTopic): number => all.filter((a) => a.topic === key).length

/** 当前栏目 + 排序后的列表 */
const visible = computed(() => {
  const list = all.filter((a) => a.topic === topic.value)
  return sortDir.value === 'asc' ? [...list].reverse() : list
})
</script>
