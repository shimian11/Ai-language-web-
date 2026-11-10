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

      <!-- 面经分享：列表视图 -->
      <template v-else-if="topic === 'exp'">
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
            <!-- 结果徽标：通过/未通过 -->
            <span class="list-meta">
              <span v-if="a.result" class="badge" :class="a.resultClass || 'ok'">{{ a.result }}</span>
            </span>
          </RouterLink>
        </div>
        <div v-else class="empty">
          <p>这个栏目还没有已发布的内容。</p>
          <RouterLink class="btn primary" to="/notes">去心得栏目看看 →</RouterLink>
        </div>
      </template>

      <!-- 八股考题 / 算法题：知识图谱视图 -->
      <template v-else>
        <div v-if="graphArticles.length" class="kg-wrap">
          <p class="kg-hint">
            {{ topic === 'bigu' ? '按知识点串联的高频考题' : '按题型串联的算法沉淀' }} · 点击节点查看文章
          </p>
          <KnowledgeGraph
            :articles="graphArticles"
            :root-label="topic === 'bigu' ? '八股考题' : '算法题'"
            @open="openArticle"
          />
          <div class="list kg-list-below">
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
              <span class="list-meta">
                <span v-for="t in a.tags.slice(0, 2)" :key="t" class="tag">{{ t }}</span>
              </span>
            </RouterLink>
          </div>
        </div>
        <div v-else class="empty">
          <p>这个栏目还没有已发布的内容。</p>
          <RouterLink class="btn primary" to="/notes">去心得栏目看看 →</RouterLink>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import KnowledgeGraph from '@/components/visitor/KnowledgeGraph.vue'
import { listPublishedArticles } from '@/api/article'
import type { Article, ArticleTopic } from '@/types'

const router = useRouter()

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

/** 图谱视图数据：当前栏目的文章（按 tags[0] 聚合为主题） */
const graphArticles = computed(() => visible.value)

function openArticle(id: number): void {
  void router.push(`/interview/${id}`)
}

onMounted(load)
</script>

<style scoped>
.kg-wrap {
  margin-top: 4px;
}

.kg-hint {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--ink-3);
  margin: 0 0 12px;
}

.kg-list-below {
  margin-top: 26px;
  padding-top: 8px;
}

/* 窄屏：图谱节点必然拥挤，降级为纯列表 */
@media (max-width: 820px) {
  .kg-wrap > .kg {
    display: none;
  }
  .kg-hint {
    display: none;
  }
  .kg-list-below {
    margin-top: 0;
  }
}
</style>
