<template>
  <!-- 后台文章管理：心得 / 面试共用（按栏目折叠分组 + 批量上下架 + 手动排序） -->
  <div class="am-page">
    <div class="am-head">
      <div>
        <h1>{{ meta.label }}管理</h1>
        <p>{{ topics.map((t) => t.label).join(' / ') }} · 共 {{ all.length }} 篇 · 默认折叠</p>
      </div>
      <el-button type="primary" round size="large" @click="goNew">＋ {{ meta.editorTitle }}</el-button>
    </div>

    <div class="am-toolbar">
      <div class="am-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="am-tab"
          :class="{ on: statusFilter === tab.value }"
          @click="statusFilter = tab.value"
        >
          {{ tab.label }}<span class="n">{{ tab.count }}</span>
        </button>
      </div>

      <div class="am-tabs">
        <button type="button" class="am-tab" :class="{ on: sortMode === 'manual' }" @click="sortMode = 'manual'">
          手动顺序
        </button>
        <button type="button" class="am-tab" :class="{ on: sortMode === 'desc' }" @click="sortMode = 'desc'">
          最新优先
        </button>
        <button type="button" class="am-tab" :class="{ on: sortMode === 'asc' }" @click="sortMode = 'asc'">
          最早优先
        </button>
      </div>

      <div class="am-spacer"></div>

      <button class="am-tab" type="button" @click="toggleAll">
        {{ allExpanded ? '收起全部' : '展开全部' }}
      </button>
      <input v-model="keyword" class="am-search" type="search" placeholder="搜索标题…" />
    </div>

    <div v-if="selectedIds.size" class="am-batch">
      <span>已选 <b>{{ selectedIds.size }}</b> 篇</span>
      <button class="am-btn ghost" type="button" :disabled="batchSaving" @click="batchStatus('PUBLISHED')">
        批量上架
      </button>
      <button class="am-btn ghost" type="button" :disabled="batchSaving" @click="batchStatus('DRAFT')">
        批量下架
      </button>
      <div class="am-spacer"></div>
      <button class="am-btn ghost" type="button" @click="clearSelection">清空选择</button>
    </div>

    <div class="am-panel-wrap">
      <div class="am-panel">
        <table class="am-table">
          <thead>
            <tr>
              <th style="width: 42px">
                <input
                  class="am-cb"
                  type="checkbox"
                  :checked="allVisibleSelected"
                  :indeterminate.prop="someVisibleSelected"
                  @change="toggleSelectAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th>标题</th>
              <th>状态</th>
              <th class="am-hide-sm">展示日期</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="g in groups" :key="g.key">
              <tr
                class="am-group-row"
                :class="{
                  open: expanded.has(g.key),
                  dragging: dragState?.type === 'group' && dragState?.key === g.key,
                  'drop-target': dropTarget === `group:${g.key}`,
                }"
                @dragover.prevent="onGroupDragOver(g.key)"
                @dragleave="onGroupDragLeave(g.key)"
                @drop.prevent="onGroupDrop(g.key)"
              >
                <td colspan="5">
                  <div class="am-g-head">
                    <span
                      class="am-drag"
                      draggable="true"
                      title="拖动排序，或使用 ↑↓"
                      @dragstart="onGroupDragStart($event, g.key)"
                      @dragend="clearDrag"
                      >⠿</span
                    >
                    <input
                      class="am-cb"
                      type="checkbox"
                      :checked="isGroupAllSelected(g)"
                      :indeterminate.prop="isGroupSomeSelected(g)"
                      @change="toggleGroupSelection(g, ($event.target as HTMLInputElement).checked)"
                    />
                    <button class="am-g-toggle" type="button" @click="toggleGroup(g.key)">
                      <span class="am-chevron">▶</span>
                      <b>{{ g.name }}</b>
                      <span class="am-g-count">{{ g.rows.length }} 篇</span>
                      <span class="am-g-latest">最近更新 {{ g.latest || '—' }}</span>
                    </button>
                    <div class="am-order">
                      <button class="am-btn ghost" type="button" title="上移分组" @click.stop="moveGroup(g.key, -1)">
                        ↑
                      </button>
                      <button class="am-btn ghost" type="button" title="下移分组" @click.stop="moveGroup(g.key, 1)">
                        ↓
                      </button>
                    </div>
                    <div class="am-g-batch">
                      <button
                        class="am-btn ghost"
                        type="button"
                        :disabled="batchSaving"
                        @click.stop="batchGroupStatus(g, 'PUBLISHED')"
                      >
                        批量上架
                      </button>
                      <button
                        class="am-btn ghost"
                        type="button"
                        :disabled="batchSaving"
                        @click.stop="batchGroupStatus(g, 'DRAFT')"
                      >
                        批量下架
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              <tr
                v-for="a in expanded.has(g.key) ? g.rows : []"
                :key="a.id"
                :class="{
                  dragging: dragState?.type === 'item' && dragState?.id === a.id,
                  'drop-target': dropTarget === `item:${a.id}`,
                }"
                @dragover.prevent="onItemDragOver(g, a)"
                @dragleave="onItemDragLeave(a.id)"
                @drop.prevent="onItemDrop(g, a)"
              >
                <td>
                  <input
                    class="am-cb"
                    type="checkbox"
                    :checked="selectedIds.has(a.id)"
                    @change="toggleSelect(a.id, ($event.target as HTMLInputElement).checked)"
                  />
                </td>
                <td>
                  <div class="am-row-title">
                    <span
                      class="am-drag"
                      draggable="true"
                      title="拖动排序，或使用 ↑↓"
                      @dragstart="onItemDragStart($event, g.key, a.id)"
                      @dragend="clearDrag"
                      >⠿</span
                    >
                    <div class="am-order">
                      <button class="am-btn ghost" type="button" title="上移" @click.stop.prevent="moveItem(g.key, a.id, -1)">
                        ↑
                      </button>
                      <button class="am-btn ghost" type="button" title="下移" @click.stop.prevent="moveItem(g.key, a.id, 1)">
                        ↓
                      </button>
                    </div>
                    <div>
                      <div class="am-title">{{ a.title }}</div>
                      <span class="am-sub">{{ a.summary }}</span>
                    </div>
                  </div>
                </td>
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
                    <a class="am-op" :href="`${meta.listPath}/${a.id}`" target="_blank" rel="noopener">预览</a>
                    <button class="am-op pub" type="button" @click="onToggleStatus(a)">
                      {{ a.status === 'PUBLISHED' ? '下架' : '发布' }}
                    </button>
                    <button class="am-op danger" type="button" @click="onRemove(a)">删除</button>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!groups.length">
              <td colspan="5" class="am-empty">
                {{ loading ? '正在加载…' : '没有符合条件的内容' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="am-foot">
          <span>
            当前显示 <b>{{ visibleCount }}</b> 篇 · 共 <b>{{ all.length }}</b> 篇（草稿
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

import { pageArticles, removeArticle, updateArticleOrder, updateArticleStatus } from '@/api/article'
import { ARTICLE_TOPICS, ARTICLE_TYPE_META, topicLabel } from '@/config/article'

import type { Article, EntryStatus, ArticleType } from '@/types'

const props = defineProps<{ type: ArticleType }>()

const router = useRouter()
type SortMode = 'manual' | 'desc' | 'asc'

const meta = computed(() => ARTICLE_TYPE_META[props.type])
const topics = computed(() => ARTICLE_TOPICS[props.type])

const all = ref<Article[]>([])
const loading = ref(true)
const statusFilter = ref<'all' | EntryStatus>('all')
const sortMode = ref<SortMode>('manual')
const keyword = ref('')
const expanded = ref<Set<string>>(new Set())
const selectedIds = ref<Set<number>>(new Set())
const batchSaving = ref(false)

/** 全量手动顺序（跨分组连续，存后端 sort） */
const manualOrder = ref<number[]>([])
const savingOrder = ref(false)

function groupKeyOf(a: Article): string {
  return a.topic || '__other'
}

function groupName(key: string): string {
  return key === '__other' ? '未分类' : topicLabel(props.type, key)
}

const publishedCount = computed(() => all.value.filter((a) => a.status === 'PUBLISHED').length)
const draftCount = computed(() => all.value.length - publishedCount.value)
const statusTabs = computed(() => [
  { value: 'all' as const, label: '全部', count: all.value.length },
  { value: 'PUBLISHED' as const, label: '已发布', count: publishedCount.value },
  { value: 'DRAFT' as const, label: '草稿', count: draftCount.value },
])

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return all.value.filter((a) => {
    if (statusFilter.value !== 'all' && a.status !== statusFilter.value) return false
    if (!kw) return true
    return `${a.title} ${a.summary ?? ''}`.toLowerCase().includes(kw)
  })
})

interface Group {
  key: string
  name: string
  rows: Article[]
  latest: string
}

function orderIndex(id: number): number {
  const i = manualOrder.value.indexOf(id)
  return i === -1 ? Number.MAX_SAFE_INTEGER : i
}

const groups = computed<Group[]>(() => {
  const map = new Map<string, Group>()
  for (const a of filtered.value) {
    const key = groupKeyOf(a)
    if (!map.has(key)) map.set(key, { key, name: groupName(key), rows: [], latest: '' })
    map.get(key)!.rows.push(a)
  }
  const list = [...map.values()]
  for (const g of list) {
    if (sortMode.value === 'manual') {
      g.rows.sort((a, b) => orderIndex(a.id) - orderIndex(b.id))
    } else {
      g.rows.sort((a, b) => {
        const da = a.date || ''
        const db = b.date || ''
        return sortMode.value === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
      })
    }
    g.latest = g.rows.reduce((max, a) => (a.date > max ? a.date : max), '')
  }
  return list.sort((a, b) => {
    if (sortMode.value === 'manual') {
      const ia = Math.min(...a.rows.map((r) => orderIndex(r.id)))
      const ib = Math.min(...b.rows.map((r) => orderIndex(r.id)))
      if (ia !== ib) return ia - ib
    } else {
      return a.rows[0].date.localeCompare(b.rows[0].date) * (sortMode.value === 'asc' ? 1 : -1)
    }
    return a.name.localeCompare(b.name)
  })
})

const visibleCount = computed(() => groups.value.reduce((n, g) => n + g.rows.length, 0))
const allExpanded = computed(() => groups.value.length > 0 && groups.value.every((g) => expanded.value.has(g.key)))

/* ===== 勾选 ===== */
const allVisibleSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((a) => selectedIds.value.has(a.id)),
)
const someVisibleSelected = computed(
  () => filtered.value.some((a) => selectedIds.value.has(a.id)) && !allVisibleSelected.value,
)

function isGroupAllSelected(g: Group): boolean {
  return g.rows.length > 0 && g.rows.every((a) => selectedIds.value.has(a.id))
}
function isGroupSomeSelected(g: Group): boolean {
  return g.rows.some((a) => selectedIds.value.has(a.id)) && !isGroupAllSelected(g)
}
function toggleSelect(id: number, checked: boolean): void {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}
function toggleGroupSelection(g: Group, checked: boolean): void {
  const next = new Set(selectedIds.value)
  for (const a of g.rows) {
    if (checked) next.add(a.id)
    else next.delete(a.id)
  }
  selectedIds.value = next
}
function toggleSelectAll(checked: boolean): void {
  const next = new Set(selectedIds.value)
  for (const a of filtered.value) {
    if (checked) next.add(a.id)
    else next.delete(a.id)
  }
  selectedIds.value = next
}
function clearSelection(): void {
  selectedIds.value = new Set()
}

async function batchStatus(status: EntryStatus, ids?: number[]): Promise<void> {
  const target = ids ?? [...selectedIds.value]
  if (!target.length) return
  batchSaving.value = true
  try {
    await Promise.all(target.map((id) => updateArticleStatus(id, status)))
    ElMessage.success(status === 'PUBLISHED' ? `已批量上架 ${target.length} 篇` : `已批量下架 ${target.length} 篇`)
    clearSelection()
    await load()
  } finally {
    batchSaving.value = false
  }
}
function batchGroupStatus(g: Group, status: EntryStatus): void {
  const ids = all.value.filter((a) => groupKeyOf(a) === g.key).map((a) => a.id)
  void batchStatus(status, ids)
}

/* ===== 展开 ===== */
function toggleGroup(key: string): void {
  const next = new Set(expanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expanded.value = next
}
function toggleAll(): void {
  expanded.value = allExpanded.value ? new Set() : new Set(groups.value.map((g) => g.key))
}

/* ===== 排序 ===== */
async function persistOrder(): Promise<void> {
  if (savingOrder.value) return
  savingOrder.value = true
  try {
    await updateArticleOrder(manualOrder.value)
    const sortMap = new Map(manualOrder.value.map((id, i) => [id, (i + 1) * 10]))
    all.value = all.value.map((a) => ({ ...a, sort: sortMap.get(a.id) ?? a.sort }))
    ElMessage.success('顺序已保存')
  } catch {
    await load()
  } finally {
    savingOrder.value = false
  }
}

function applyServerOrder(): void {
  const sorted = [...all.value].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id)
  manualOrder.value = sorted.map((a) => a.id)
}

function moveGroup(key: string, dir: -1 | 1): void {
  const blocks: Array<{ key: string; ids: number[] }> = []
  const indexByKey = new Map<string, number>()
  for (const id of manualOrder.value) {
    const article = all.value.find((a) => a.id === id)
    if (!article) continue
    const k = groupKeyOf(article)
    if (!indexByKey.has(k)) {
      indexByKey.set(k, blocks.length)
      blocks.push({ key: k, ids: [] })
    }
    blocks[indexByKey.get(k)!].ids.push(id)
  }
  const i = blocks.findIndex((b) => b.key === key)
  const j = i + dir
  if (i === -1 || j < 0 || j >= blocks.length) return
  const tmp = blocks[i]
  blocks[i] = blocks[j]
  blocks[j] = tmp
  manualOrder.value = blocks.flatMap((b) => b.ids)
  sortMode.value = 'manual'
  void persistOrder()
}

function moveItem(key: string, id: number, dir: -1 | 1): void {
  const ids = manualOrder.value.filter((x) => {
    const a = all.value.find((item) => item.id === x)
    return a !== undefined && groupKeyOf(a) === key
  })
  const i = ids.indexOf(id)
  const j = i + dir
  if (i === -1 || j < 0 || j >= ids.length) return
  const a = manualOrder.value.indexOf(ids[i])
  const b = manualOrder.value.indexOf(ids[j])
  const next = [...manualOrder.value]
  const tmp = next[a]
  next[a] = next[b]
  next[b] = tmp
  manualOrder.value = next
  sortMode.value = 'manual'
  void persistOrder()
}

/* ===== 拖拽 ===== */
interface DragState {
  type: 'group' | 'item'
  key: string
  id?: number
}
const dragState = ref<DragState | null>(null)
const dropTarget = ref<string | null>(null)

function clearDrag(): void {
  dragState.value = null
  dropTarget.value = null
}
function onGroupDragStart(e: DragEvent, key: string): void {
  dragState.value = { type: 'group', key }
  e.dataTransfer?.setData('text/plain', key)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
function onGroupDragOver(key: string): void {
  if (dragState.value?.type === 'group' && dragState.value.key !== key) dropTarget.value = `group:${key}`
}
function onGroupDragLeave(key: string): void {
  if (dropTarget.value === `group:${key}`) dropTarget.value = null
}
function onGroupDrop(key: string): void {
  const drag = dragState.value
  if (!drag || drag.type !== 'group' || drag.key === key) {
    clearDrag()
    return
  }
  const idsOf = (k: string) => new Set(all.value.filter((a) => groupKeyOf(a) === k).map((a) => a.id))
  const moving = idsOf(drag.key)
  const block = manualOrder.value.filter((id) => moving.has(id))
  const rest = manualOrder.value.filter((id) => !moving.has(id))
  const target = idsOf(key)
  const at = rest.findIndex((id) => target.has(id))
  manualOrder.value = at === -1 ? [...rest, ...block] : [...rest.slice(0, at), ...block, ...rest.slice(at)]
  sortMode.value = 'manual'
  void persistOrder()
  clearDrag()
}
function onItemDragStart(e: DragEvent, key: string, id: number): void {
  dragState.value = { type: 'item', key, id }
  e.dataTransfer?.setData('text/plain', String(id))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
function onItemDragOver(g: Group, a: Article): void {
  const drag = dragState.value
  if (!drag || drag.type !== 'item' || drag.key !== g.key || drag.id === a.id) return
  dropTarget.value = `item:${a.id}`
}
function onItemDragLeave(id: number): void {
  if (dropTarget.value === `item:${id}`) dropTarget.value = null
}
function onItemDrop(g: Group, a: Article): void {
  const drag = dragState.value
  if (!drag || drag.type !== 'item' || drag.id === undefined) {
    clearDrag()
    return
  }
  if (drag.key !== g.key) {
    ElMessage.warning('只能在同一分组内调整顺序')
    clearDrag()
    return
  }
  if (drag.id === a.id) {
    clearDrag()
    return
  }
  const from = manualOrder.value.indexOf(drag.id)
  const to = manualOrder.value.indexOf(a.id)
  if (from !== -1 && to !== -1) {
    const next = [...manualOrder.value]
    next.splice(from, 1)
    const at = next.indexOf(a.id)
    next.splice(at === -1 ? next.length : at, 0, drag.id)
    manualOrder.value = next
    sortMode.value = 'manual'
    void persistOrder()
  }
  clearDrag()
}

/* ===== 数据 ===== */
async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await pageArticles({ type: props.type, size: 200, sort: 'manual' })
    all.value = data.list
    applyServerOrder()
  } finally {
    loading.value = false
  }
}

function goNew(): void {
  router.push({ name: 'admin-article-new', query: { type: props.type } })
}

async function onToggleStatus(a: Article): Promise<void> {
  const next = a.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
  await updateArticleStatus(a.id, next)
  ElMessage.success(next === 'PUBLISHED' ? '已发布' : '已转为草稿（下架）')
  await load()
}

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
  selectedIds.value.delete(a.id)
  selectedIds.value = new Set(selectedIds.value)
  ElMessage.success('已删除')
  await load()
}

watch(
  () => props.type,
  () => {
    statusFilter.value = 'all'
    keyword.value = ''
    expanded.value = new Set()
    selectedIds.value = new Set()
    load()
  },
)

onMounted(load)
</script>

<style src="@/assets/styles/admin-article.css"></style>
