<template>
  <!-- 后台实习管理：按公司折叠分组（组头就地展开/收起） -->
  <div class="am-page">
    <div class="am-head">
      <div>
        <h1>实习管理</h1>
        <p>共 {{ all.length }} 篇记录 · 按公司折叠分组 · 公司名脱敏</p>
      </div>
      <el-button type="primary" round size="large" @click="goNew">＋ 写实习记录</el-button>
    </div>

    <div class="am-toolbar">
      <div class="am-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="am-tab"
          :class="{ on: status === tab.value }"
          @click="status = tab.value"
        >
          {{ tab.label }}<span class="n">{{ tab.count }}</span>
        </button>
      </div>

      <div class="am-tabs">
        <button type="button" class="am-tab" :class="{ on: sortDir === 'desc' }" @click="sortDir = 'desc'">
          最新优先
        </button>
        <button type="button" class="am-tab" :class="{ on: sortDir === 'asc' }" @click="sortDir = 'asc'">
          最早优先
        </button>
      </div>

      <div class="am-spacer"></div>

      <button class="am-tab" type="button" @click="toggleAll">{{ allOpen ? '收起全部' : '展开全部' }}</button>
      <input v-model="keyword" class="am-search" type="search" placeholder="搜索记录标题…" />
    </div>

    <div class="am-panel-wrap">
      <div class="am-panel">
        <table class="am-table">
          <thead>
            <tr>
              <th style="width: 50%">记录</th>
              <th>时间点</th>
              <th>状态</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="g in groups" :key="g.key">
              <tr class="am-group-row" :class="{ open: isOpen(g.key) }">
                <td colspan="4">
                  <button type="button" class="am-g-toggle" @click="toggleGroup(g.key)">
                    <span class="am-chevron">▶</span>
                    <b>{{ g.name }}</b>
                    <span v-if="g.meta" class="am-g-tag">{{ g.meta }}</span>
                    <span v-if="g.milestone" class="am-g-tag">里程碑</span>
                    <span class="am-g-count">{{ g.items.length }} 篇</span>
                    <span class="am-g-latest">最近更新 {{ g.latest || '—' }}</span>
                  </button>
                </td>
              </tr>
              <tr v-for="a in g.items" v-show="isOpen(g.key)" :key="a.id">
                <td>
                  <div class="am-title">{{ a.title }}</div>
                  <span class="am-sub">{{ a.summary }}</span>
                </td>
                <td class="am-date">{{ a.date || '—' }}</td>
                <td>
                  <span class="am-st" :class="a.status === 'PUBLISHED' ? 'pub' : 'draft'">
                    <i></i>{{ a.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                  </span>
                </td>
                <td>
                  <div class="am-ops">
                    <RouterLink
                      class="am-op"
                      :to="{ name: 'admin-article-edit', params: { id: String(a.id) }, query: { type: 'internship' } }"
                    >
                      编辑
                    </RouterLink>
                    <a class="am-op" :href="`/internship/${a.id}`" target="_blank" rel="noopener">预览</a>
                    <button class="am-op pub" type="button" @click="onToggleStatus(a)">
                      {{ a.status === 'PUBLISHED' ? '下架' : '发布' }}
                    </button>
                    <button class="am-op danger" type="button" @click="onRemove(a)">删除</button>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!groups.length">
              <td colspan="4" class="am-empty">
                {{ loading ? '正在加载…' : '没有符合条件的记录' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="am-foot">
          <span>
            当前显示 <b>{{ shownCount }}</b> 篇 · 共 <b>{{ all.length }}</b> 篇 · 排序：<b>{{
              sortDir === 'desc' ? '最新优先' : '最早优先'
            }}</b>
          </span>
          <span>公司名均为脱敏别名</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  listCompanies,
  pageArticles,
  removeArticle,
  updateArticleStatus,
} from '@/api/article'
import type { CompanyItem } from '@/api/article'

import type { Article, EntryStatus } from '@/types'

const router = useRouter()

/** 全量实习记录与公司别名 */
const all = ref<Article[]>([])
const companies = ref<CompanyItem[]>([])
const loading = ref(true)

/** 状态筛选、排序方向、关键词 */
const status = ref<'all' | EntryStatus>('all')
const sortDir = ref<'desc' | 'asc'>('desc')
const keyword = ref('')

/** 折叠状态：key → 是否展开（默认只展开第一组，与原型一致） */
const openMap = reactive<Record<string, boolean>>({})

/** 未分组记录的虚拟分组标识 */
const UNGROUPED = '__none'

interface Group {
  key: string
  name: string
  meta: string
  milestone: boolean
  items: Article[]
  latest: string
}

/** 状态 Tab（计数基于全部记录） */
const statusTabs = computed(() => {
  const published = all.value.filter((a) => a.status === 'PUBLISHED').length
  return [
    { value: 'all' as const, label: '全部', count: all.value.length },
    { value: 'PUBLISHED' as const, label: '已发布', count: published },
    { value: 'DRAFT' as const, label: '草稿', count: all.value.length - published },
  ]
})

/** 按公司分组（状态/关键词筛选后），组内按展示日期排序 */
const groups = computed<Group[]>(() => {
  const kw = keyword.value.trim()
  const visible = all.value.filter((a) => {
    const okStatus = status.value === 'all' || a.status === status.value
    const okKw = !kw || a.title.includes(kw)
    return okStatus && okKw
  })

  // 公司顺序以 company.sort 为准，未挂公司的记录归入「未分组」
  const result: Group[] = []
  for (const co of companies.value) {
    const items = visible.filter((a) => a.company === co.key)
    if (!items.length) continue
    result.push({
      key: co.key,
      name: co.name,
      meta: co.meta ?? '',
      milestone: Boolean(co.milestone),
      items,
      latest: items[0]?.date ?? '',
    })
  }
  const ungrouped = visible.filter((a) => !a.company)
  if (ungrouped.length) {
    result.push({
      key: UNGROUPED,
      name: '未分组',
      meta: '',
      milestone: false,
      items: ungrouped,
      latest: ungrouped[0]?.date ?? '',
    })
  }
  return result
})

/** 当前显示条数（筛选后） */
const shownCount = computed(() => groups.value.reduce((sum, g) => sum + g.items.length, 0))

/** 是否全部展开 */
const allOpen = computed(() => groups.value.every((g) => isOpen(g.key)))

/** 某组是否展开 */
function isOpen(key: string): boolean {
  return openMap[key] === true
}

/** 切换单个分组 */
function toggleGroup(key: string): void {
  openMap[key] = !isOpen(key)
}

/** 展开全部 / 收起全部 */
function toggleAll(): void {
  const next = !allOpen.value
  for (const g of groups.value) openMap[g.key] = next
}

/** 拉取公司列表与全部实习记录（登录态下含草稿） */
async function load(): Promise<void> {
  loading.value = true
  try {
    const [co, data] = await Promise.all([
      listCompanies(),
      pageArticles({ type: 'internship', size: 200 }),
    ])
    companies.value = co
    all.value = data.list
    // 默认只展开第一组
    groups.value.forEach((g, i) => {
      if (openMap[g.key] === undefined) openMap[g.key] = i === 0
    })
  } finally {
    loading.value = false
  }
}

/** 新建实习记录 */
function goNew(): void {
  router.push({ name: 'admin-article-new', query: { type: 'internship' } })
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
    await ElMessageBox.confirm(`确认删除《${a.title}》？删除后不可恢复。`, '删除记录', {
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

onMounted(load)
</script>

<style src="@/assets/styles/admin-article.css"></style>
