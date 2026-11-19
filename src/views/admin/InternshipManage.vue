<template>
  <!-- 后台实习管理：按公司折叠分组（组头就地展开/收起） -->
  <div class="am-page">
    <div class="am-head">
      <div>
        <h1>实习管理</h1>
        <p>共 {{ all.length }} 篇记录 · 按公司折叠分组 · 默认折叠 · 公司名脱敏</p>
      </div>
      <div class="am-head-ops">
        <button class="am-btn ghost" type="button" @click="openNodePanel">
          节点管理<span v-if="emptyNodeCount" class="am-dot-badge">{{ emptyNodeCount }}</span>
        </button>
        <el-button type="primary" round size="large" @click="goNew">＋ 写实习记录</el-button>
      </div>
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

      <button class="am-tab" type="button" @click="toggleAll">{{ allOpen ? '收起全部' : '展开全部' }}</button>
      <input v-model="keyword" class="am-search" type="search" placeholder="搜索记录标题…" />
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
              <th style="width: 46%">记录</th>
              <th>时间点</th>
              <th>状态</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="g in groups" :key="g.key">
              <tr
                class="am-group-row"
                :class="{
                  open: isOpen(g.key),
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
                    <button type="button" class="am-g-toggle" @click="toggleGroup(g.key)">
                      <span class="am-chevron">▶</span>
                      <b>{{ g.name }}</b>
                      <span v-if="g.meta" class="am-g-tag">{{ g.meta }}</span>
                      <span v-if="g.milestone" class="am-g-tag">里程碑</span>
                      <span class="am-g-count">{{ g.items.length }} 篇</span>
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
                v-for="a in g.items"
                v-show="isOpen(g.key)"
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
              <td colspan="5" class="am-empty">
                {{ loading ? '正在加载…' : '没有符合条件的记录' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="am-foot">
          <span>
            当前显示 <b>{{ shownCount }}</b> 篇 · 共 <b>{{ all.length }}</b> 篇 · 排序：<b>{{
              sortMode === 'manual' ? '手动顺序' : sortMode === 'desc' ? '最新优先' : '最早优先'
            }}</b>
          </span>
          <span>公司名均为脱敏别名</span>
        </div>
      </div>
    </div>

    <!-- 节点管理：时间线骨架（新增/编辑/删除；空节点在前台不展示，可在此清理） -->
    <el-drawer v-model="nodePanel" title="时间线节点" size="520px" :with-header="false">
      <div class="np">
        <div class="np-head">
          <div>
            <h2>时间线节点</h2>
            <p>节点即实习时间线上的公司别名；没有已发布记录的节点不会出现在前台。</p>
          </div>
          <button class="np-close" type="button" aria-label="关闭" @click="nodePanel = false">✕</button>
        </div>

        <div class="np-list">
          <div v-for="n in nodeList" :key="n.key" class="np-item" :class="{ empty: !n.countAll }">
            <div class="np-main">
              <div class="np-name">
                {{ n.name }}
                <span v-if="n.milestone" class="np-tag">里程碑</span>
                <span v-if="!n.countAll" class="np-tag warn">空节点</span>
              </div>
              <div class="np-meta">{{ n.meta || '未填角色标注' }}</div>
            </div>
            <div class="np-count">
              <b>{{ n.countAll ?? 0 }}</b> 篇
              <span class="np-sub">已发布 {{ n.countPublished ?? 0 }}</span>
            </div>
            <div class="np-ops">
              <button class="np-op" type="button" @click="editNode(n)">编辑</button>
              <button class="np-op danger" type="button" :disabled="!!n.countAll" @click="onRemoveNode(n)">
                {{ n.countAll ? '有记录' : '删除' }}
              </button>
            </div>
          </div>
          <p v-if="!nodeList.length" class="np-empty">还没有节点，先新增一个（如「某大厂 · 前端 · 2026.06—09」）。</p>
        </div>

        <!-- 新增 / 编辑表单 -->
        <div class="np-form">
          <div class="np-form-title">{{ editingKey ? '编辑节点' : '新增节点' }}</div>
          <div class="np-field">
            <label for="np-name">公司别名<b>*</b></label>
            <input id="np-name" v-model="nodeForm.name" class="np-input" placeholder="如：某大厂（脱敏，不写真实公司名）" />
          </div>
          <div class="np-field">
            <label for="np-meta">角色 / 时间段</label>
            <input id="np-meta" v-model="nodeForm.meta" class="np-input" placeholder="如：前端 · 2026.06 — 09" />
          </div>
          <label class="np-check">
            <input v-model="nodeForm.milestone" type="checkbox" />
            标记为里程碑节点（前台金色高亮，如「阶段总结」）
          </label>
          <div class="np-form-ops">
            <button class="np-btn primary" type="button" :disabled="nodeSaving" @click="saveNode">
              {{ nodeSaving ? '保存中…' : editingKey ? '保存修改' : '新增节点' }}
            </button>
            <button v-if="editingKey" class="np-btn" type="button" @click="resetNodeForm">取消编辑</button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import {
  createCompany,
  listCompanies,
  pageArticles,
  removeArticle,
  removeCompany,
  updateArticleOrder,
  updateArticleStatus,
  updateCompany,
} from '@/api/article'
import type { CompanyItem } from '@/api/article'

import type { Article, EntryStatus } from '@/types'

const router = useRouter()

/** 全量实习记录与公司别名 */
const all = ref<Article[]>([])
const companies = ref<CompanyItem[]>([])
const loading = ref(true)

/** 状态筛选、排序模式、关键词 */
type SortMode = 'manual' | 'desc' | 'asc'
const status = ref<'all' | EntryStatus>('all')
const sortMode = ref<SortMode>('manual')
const keyword = ref('')

/** 折叠状态：key → 是否展开；默认全部折叠 */
const openMap = reactive<Record<string, boolean>>({})

/** 勾选与批量 */
const selectedIds = ref<Set<number>>(new Set())
const batchSaving = ref(false)

/** 全量手动顺序（跨分组连续，存后端 sort） */
const manualOrder = ref<number[]>([])
const savingOrder = ref(false)

/** 未分组记录的虚拟分组标识 */
const UNGROUPED = '__none'

function groupKeyOf(a: Article): string {
  return a.company || UNGROUPED
}

function orderIndex(id: number): number {
  const i = manualOrder.value.indexOf(id)
  return i === -1 ? Number.MAX_SAFE_INTEGER : i
}

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

/** 按公司分组（状态/关键词筛选后），组内与分组都支持手动顺序 */
const groups = computed<Group[]>(() => {
  const kw = keyword.value.trim()
  const visible = all.value.filter((a) => {
    const okStatus = status.value === 'all' || a.status === status.value
    const okKw = !kw || a.title.includes(kw)
    return okStatus && okKw
  })

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
      latest: '',
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
      latest: '',
    })
  }

  for (const g of result) {
    if (sortMode.value === 'manual') {
      g.items.sort((a, b) => orderIndex(a.id) - orderIndex(b.id))
    } else {
      g.items.sort((a, b) => {
        const da = a.date || ''
        const db = b.date || ''
        return sortMode.value === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
      })
    }
    g.latest = g.items.reduce((max, a) => (a.date > max ? a.date : max), '')
  }

  if (sortMode.value === 'manual') {
    result.sort((a, b) => {
      const ia = Math.min(...a.items.map((item) => orderIndex(item.id)))
      const ib = Math.min(...b.items.map((item) => orderIndex(item.id)))
      return ia - ib
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

/* ===== 勾选与批量 ===== */
const allVisibleSelected = computed(() => {
  const visible = groups.value.flatMap((g) => g.items)
  return visible.length > 0 && visible.every((a) => selectedIds.value.has(a.id))
})
const someVisibleSelected = computed(() => {
  const visible = groups.value.flatMap((g) => g.items)
  return visible.some((a) => selectedIds.value.has(a.id)) && !allVisibleSelected.value
})

function isGroupAllSelected(g: Group): boolean {
  return g.items.length > 0 && g.items.every((a) => selectedIds.value.has(a.id))
}
function isGroupSomeSelected(g: Group): boolean {
  return g.items.some((a) => selectedIds.value.has(a.id)) && !isGroupAllSelected(g)
}
function toggleSelect(id: number, checked: boolean): void {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}
function toggleGroupSelection(g: Group, checked: boolean): void {
  const next = new Set(selectedIds.value)
  for (const a of g.items) {
    if (checked) next.add(a.id)
    else next.delete(a.id)
  }
  selectedIds.value = next
}
function toggleSelectAll(checked: boolean): void {
  const next = new Set(selectedIds.value)
  for (const a of groups.value.flatMap((g) => g.items)) {
    if (checked) next.add(a.id)
    else next.delete(a.id)
  }
  selectedIds.value = next
}
function clearSelection(): void {
  selectedIds.value = new Set()
}

async function batchStatus(target: EntryStatus, ids?: number[]): Promise<void> {
  const list = ids ?? [...selectedIds.value]
  if (!list.length) return
  batchSaving.value = true
  try {
    await Promise.all(list.map((id) => updateArticleStatus(id, target)))
    ElMessage.success(target === 'PUBLISHED' ? `已批量上架 ${list.length} 篇` : `已批量下架 ${list.length} 篇`)
    clearSelection()
    await load()
  } finally {
    batchSaving.value = false
  }
}
function batchGroupStatus(g: Group, target: EntryStatus): void {
  const ids = all.value.filter((a) => groupKeyOf(a) === g.key).map((a) => a.id)
  void batchStatus(target, ids)
}

/* ===== 手动排序 ===== */
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

/** 拉取公司列表与全部实习记录（登录态下含草稿） */
async function load(): Promise<void> {
  loading.value = true
  try {
    const [co, data] = await Promise.all([
      listCompanies(),
      pageArticles({ type: 'internship', size: 200, sort: 'manual' }),
    ])
    companies.value = co
    all.value = data.list
    applyServerOrder()
  } finally {
    loading.value = false
  }
}

/** 新建实习记录 */
function goNew(): void {
  router.push({ name: 'admin-article-new', query: { type: 'internship' } })
}

/* ==================== 节点管理 ==================== */

/** 抽屉开关与表单 */
const nodePanel = ref(false)
const nodeSaving = ref(false)
const editingKey = ref<string | null>(null)
const nodeForm = reactive({ name: '', meta: '', milestone: false })

/** 节点列表按 sort 顺序（接口已排好） */
const nodeList = computed(() => companies.value)

/** 空节点数量（没有挂任何记录），用于头部角标提示清理 */
const emptyNodeCount = computed(() => companies.value.filter((c) => !c.countAll).length)

function openNodePanel(): void {
  resetNodeForm()
  nodePanel.value = true
}

function resetNodeForm(): void {
  editingKey.value = null
  nodeForm.name = ''
  nodeForm.meta = ''
  nodeForm.milestone = false
}

function editNode(n: CompanyItem): void {
  editingKey.value = n.key
  nodeForm.name = n.name
  nodeForm.meta = n.meta ?? ''
  nodeForm.milestone = Boolean(n.milestone)
}

async function saveNode(): Promise<void> {
  const name = nodeForm.name.trim()
  if (!name) {
    ElMessage.warning('请填写公司别名')
    return
  }
  nodeSaving.value = true
  try {
    const payload = { name, meta: nodeForm.meta.trim(), milestone: nodeForm.milestone }
    if (editingKey.value) {
      await updateCompany(editingKey.value, payload)
      ElMessage.success('节点已更新')
    } else {
      await createCompany(payload)
      ElMessage.success('节点已新增')
    }
    resetNodeForm()
    await load()
  } finally {
    nodeSaving.value = false
  }
}

async function onRemoveNode(n: CompanyItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确认删除节点「${n.name}」？该节点下没有任何记录，删除后前台时间线不再出现。`,
      '删除节点',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  await removeCompany(n.key)
  ElMessage.success('节点已删除')
  if (editingKey.value === n.key) resetNodeForm()
  await load()
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
  selectedIds.value.delete(a.id)
  selectedIds.value = new Set(selectedIds.value)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<style src="@/assets/styles/admin-article.css"></style>

<style scoped>
/* 头部操作区：节点管理 + 写记录 并排 */
.am-head-ops {
  display: flex;
  align-items: center;
  gap: 10px;
}

.am-btn.ghost {
  height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: 0.15s;
}

.am-btn.ghost:hover {
  border-color: var(--ink);
}

/* 行内排序/批量按钮压到列表尺寸 */
.am-order .am-btn.ghost,
.am-g-batch .am-btn.ghost,
.am-batch .am-btn.ghost {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

@media (max-width: 760px) {
  .am-g-batch .am-btn.ghost {
    padding: 0 7px;
    font-size: 10px;
  }
}

.am-dot-badge {
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--red);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 17px;
  text-align: center;
}

/* ===== 节点管理抽屉 ===== */
.np {
  padding: 26px 26px 40px;
}

.np-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.np-head h2 {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.np-head p {
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.7;
  max-width: 34em;
}

.np-close {
  border: 0;
  background: transparent;
  font-size: 15px;
  color: var(--ink-3);
  cursor: pointer;
  padding: 4px 6px;
}

.np-close:hover {
  color: var(--ink);
}

.np-list {
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  background: var(--card);
}

.np-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px dashed var(--line);
}

.np-item:last-child {
  border-bottom: 0;
}

.np-item.empty {
  background: rgba(201, 154, 74, 0.05);
}

.np-main {
  flex: 1;
  min-width: 0;
}

.np-name {
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.np-tag {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--line);
  color: var(--ink-2);
}

.np-tag.warn {
  border-color: rgba(201, 154, 74, 0.5);
  color: #8a6423;
  background: rgba(201, 154, 74, 0.12);
}

.np-meta {
  margin-top: 3px;
  font-size: 11.5px;
  color: var(--ink-3);
}

.np-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-2);
  text-align: right;
  white-space: nowrap;
}

.np-count b {
  font-size: 13px;
  color: var(--ink);
}

.np-sub {
  display: block;
  color: var(--ink-3);
  font-size: 9.5px;
}

.np-ops {
  display: flex;
  gap: 6px;
}

.np-op {
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 11.5px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.15s;
}

.np-op:hover:not(:disabled) {
  color: var(--ink);
  border-color: var(--ink);
}

.np-op.danger:hover:not(:disabled) {
  color: #c0392b;
  border-color: #c0392b;
}

.np-op:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.np-empty {
  padding: 22px 14px;
  text-align: center;
  font-size: 12.5px;
  color: var(--ink-2);
}

.np-form {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--paper-2);
}

.np-form-title {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.np-field {
  margin-bottom: 10px;
}

.np-field label {
  display: block;
  font-size: 11.5px;
  color: var(--ink-2);
  margin-bottom: 5px;
}

.np-field label b {
  color: var(--red);
  margin-left: 2px;
}

.np-input {
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--card);
  font-size: 13px;
  color: var(--ink);
  outline: none;
}

.np-input:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.08);
}

.np-check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--ink-2);
  margin: 4px 0 14px;
  cursor: pointer;
}

.np-form-ops {
  display: flex;
  gap: 8px;
}

.np-btn {
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-size: 12.5px;
  cursor: pointer;
}

.np-btn.primary {
  background: var(--ink);
  color: var(--paper-2);
  border-color: var(--ink);
}

.np-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
