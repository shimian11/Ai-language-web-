<template>
  <!-- 后台文章管理：心得 / 面试共用（栏目 Tab + 排序 + 搜索 + 发布/下架/删除） -->
  <div class="am-page">
    <div class="am-head">
      <div>
        <h1>{{ meta.label }}管理</h1>
        <p>{{ topics.map((t) => t.label).join(' / ') }} · 共 {{ all.length }} 篇</p>
      </div>
      <el-button type="primary" round size="large" @click="goNew">＋ {{ meta.editorTitle }}</el-button>
    </div>

    <div class="am-toolbar">
      <div class="am-tabs">
        <button
          type="button"
          class="am-tab"
          :class="{ on: topic === 'all' }"
          @click="topic = 'all'"
        >
          全部 <span class="n">{{ all.length }}</span>
        </button>
        <button
          v-for="t in topics"
          :key="t.key"
          type="button"
          class="am-tab"
          :class="{ on: topic === t.key }"
          @click="topic = t.key"
        >
          {{ t.label }} <span class="n">{{ countOf(t.key) }}</span>
        </button>
      </div>

      <div class="am-spacer"></div>

      <div class="am-tabs">
        <button type="button" class="am-tab" :class="{ on: sortDir === 'desc' }" @click="sortDir = 'desc'">
          最新优先
        </button>
        <button type="button" class="am-tab" :class="{ on: sortDir === 'asc' }" @click="sortDir = 'asc'">
          最早优先
        </button>
      </div>

      <input v-model="keyword" class="am-search" type="search" placeholder="搜索标题…" />
    </div>

    <div class="am-panel-wrap">
      <div class="am-panel">
        <table class="am-table">
          <thead>
            <tr>
              <th style="width: 46%">标题</th>
              <th>栏目</th>
              <th>状态</th>
              <th class="am-hide-sm">展示日期</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in rows" :key="a.id">
              <td>
                <div class="am-title">{{ a.title }}</div>
                <span class="am-sub">{{ a.summary }}</span>
              </td>
              <td>{{ a.sub || topicLabelOf(a.topic) }}</td>
              <td>
                <span class="am-st" :class="a.status === 'PUBLISHED' ? 'pub' : 'draft'">
                  <i></i>{{ a.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                </span>
              </td>
              <td class="am-date am-hide-sm">{{ a.date || '—' }}</td>
              <td>
                <div class="am-ops">
                  <RouterLink
                    class="am-op"
                    :to="{ name: 'admin-article-edit', params: { id: String(a.id) }, query: { type } }"
                  >
                    编辑
                  </RouterLink>
                  <a class="am-op" :href="`${meta.listPath}/${a.id}`" target="_blank" rel="noopener">
                    预览
                  </a>
                  <button class="am-op pub" type="button" @click="onToggleStatus(a)">
                    {{ a.status === 'PUBLISHED' ? '下架' : '发布' }}
                  </button>
                  <button class="am-op danger" type="button" @click="onRemove(a)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="5" class="am-empty">
                {{ loading ? '正在加载…' : '没有符合条件的内容' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="am-foot">
          <span>
            当前显示 <b>{{ rows.length }}</b> 篇 · 共 <b>{{ all.length }}</b> 篇（草稿
            <b>{{ draftCount }}</b> 篇）
          </span>
          <span>{{ meta.label }}内容仅管理员可见草稿</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { pageArticles, removeArticle, updateArticleStatus } from '@/api/article'
import { ARTICLE_TOPICS, ARTICLE_TYPE_META, topicLabel } from '@/config/article'

import type { Article, ArticleTopic, ArticleType } from '@/types'

const props = defineProps<{ type: ArticleType }>()

const router = useRouter()

/** 类型元信息与栏目 */
const meta = computed(() => ARTICLE_TYPE_META[props.type])
const topics = computed(() => ARTICLE_TOPICS[props.type])

/** 全量文章（管理端可见草稿；个人站量级一次取回，前端做栏目计数与排序） */
const all = ref<Article[]>([])
const loading = ref(true)

/** 栏目筛选（all = 全部）、排序方向、关键词 */
const topic = ref<ArticleTopic | 'all'>('all')
const sortDir = ref<'desc' | 'asc'>('desc')
const keyword = ref('')

/** 某栏目文章数 */
function countOf(key: ArticleTopic): number {
  return all.value.filter((a) => a.topic === key).length
}

/** 栏目显示名（后端已写入 sub，空值时回退配置） */
function topicLabelOf(key: string): string {
  return topicLabel(props.type, key)
}

/** 草稿数（页脚统计） */
const draftCount = computed(() => all.value.filter((a) => a.status === 'DRAFT').length)

/** 过滤 + 排序后的行 */
const rows = computed<Article[]>(() => {
  const kw = keyword.value.trim()
  const list = all.value.filter((a) => {
    const okTopic = topic.value === 'all' || a.topic === topic.value
    const okKw = !kw || a.title.includes(kw)
    return okTopic && okKw
  })
  return sortDir.value === 'asc' ? [...list].reverse() : list
})

/** 拉取该类型全部文章（登录态下后端返回全部状态） */
async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await pageArticles({ type: props.type, size: 200 })
    all.value = data.list
  } finally {
    loading.value = false
  }
}

/** 新建：编辑器按 type 自适应 */
function goNew(): void {
  router.push({ name: 'admin-article-new', query: { type: props.type } })
}

/** 发布 / 下架 */
async function onToggleStatus(a: Article): Promise<void> {
  const next = a.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
  await updateArticleStatus(a.id, next)
  ElMessage.success(next === 'PUBLISHED' ? '已发布' : '已转为草稿（下架）')
  await load()
}

/** 删除（二次确认） */
async function onRemove(a: Article): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除《${a.title}》？删除后不可恢复。`, '删除内容', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  await removeArticle(a.id)
  ElMessage.success('已删除')
  await load()
}

/** 同一组件被两个路由复用（note / interview），切换时重新取数并重置筛选 */
watch(
  () => props.type,
  () => {
    topic.value = 'all'
    keyword.value = ''
    load()
  },
)

onMounted(load)
</script>

<style src="@/assets/styles/admin-article.css"></style>
