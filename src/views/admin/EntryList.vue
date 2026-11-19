<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>案例管理</h1>
        <p>共 {{ entries.length }} 个提示词 · 默认折叠 · 支持拖拽排序</p>
      </div>
      <el-button type="primary" round size="large" @click="router.push({ name: 'admin-entry-new' })">
        ＋ 发布新提示词
      </el-button>
    </div>

    <!-- toolbar：原型 admin-entries.html 的一行横排工具条 -->
    <div class="am-toolbar">
      <div class="am-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          :class="{ on: statusFilter === tab.value }"
          @click="statusFilter = tab.value"
        >
          {{ tab.label }}<span class="am-cnt">{{ tab.count }}</span>
        </button>
      </div>
      <div class="am-tabs">
        <button type="button" :class="{ on: sortMode === 'manual' }" @click="sortMode = 'manual'">手动顺序</button>
        <button type="button" :class="{ on: sortMode === 'desc' }" @click="sortMode = 'desc'">最新优先</button>
        <button type="button" :class="{ on: sortMode === 'asc' }" @click="sortMode = 'asc'">最早优先</button>
      </div>
      <span class="am-spacer"></span>
      <button class="am-btn sm" type="button" @click="toggleAll">
        {{ allExpanded ? '收起全部' : '展开全部' }}
      </button>
      <div class="am-search">
        <input v-model="keyword" type="text" placeholder="搜索样式标题…" />
      </div>
      <RouterLink class="am-btn" :to="{ name: 'admin-entry-new' }">＋ 新建</RouterLink>
    </div>

    <!-- 勾选后出现的批量操作条 -->
    <div v-if="selectedIds.size" class="am-batch">
      <span>已选 <b>{{ selectedIds.size }}</b> 条</span>
      <button class="am-btn sm" type="button" :disabled="batchSaving" @click="batchStatus('PUBLISHED')">
        批量上架
      </button>
      <button class="am-btn sm" type="button" :disabled="batchSaving" @click="batchStatus('DRAFT')">
        批量下架
      </button>
      <span class="am-spacer"></span>
      <button class="am-btn sm" type="button" @click="clearSelection">清空选择</button>
    </div>

    <div class="panel-wrap">
      <div class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width: 42px">
                  <input
                    class="am-cb"
                    type="checkbox"
                    title="选择当前可见条目"
                    :checked="allVisibleSelected"
                    :indeterminate.prop="someVisibleSelected"
                    @change="toggleSelectAll(($event.target as HTMLInputElement).checked)"
                  />
                </th>
                <th style="width: 38%">样式名称</th>
                <th>平台</th>
                <th>状态</th>
                <th class="hide-sm">更新时间</th>
                <th style="text-align: right">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 分组头与组内行在同一张表内就地折叠（原型：不做二级页面） -->
              <template v-for="g in visibleGroups" :key="g.key">
                <tr
                  class="grp-row"
                  :class="{
                    open: expanded.has(g.key),
                    dragging: dragState?.type === 'group' && dragState?.key === g.key,
                    'drop-target': dropTarget === `group:${g.key}`,
                  }"
                  @dragover.prevent="onGroupDragOver(g.key)"
                  @dragleave="onGroupDragLeave(g.key)"
                  @drop.prevent="onGroupDrop(g.key)"
                >
                  <td colspan="6">
                    <div class="g-head">
                      <span
                        class="drag-handle"
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
                      <button class="g-toggle" type="button" @click="toggleGroup(g.key)">
                        <span class="g-chevron">▶</span>
                        <b>{{ g.name }}</b>
                        <span class="g-count">{{ g.rows.length }} 条</span>
                        <span class="g-latest">最近更新 {{ g.latest || '暂无条目' }}</span>
                      </button>
                      <div class="g-order">
                        <button class="am-btn xs" type="button" title="上移分组" @click.stop="moveGroup(g.key, -1)">
                          ↑
                        </button>
                        <button class="am-btn xs" type="button" title="下移分组" @click.stop="moveGroup(g.key, 1)">
                          ↓
                        </button>
                      </div>
                      <div class="g-batch">
                        <button
                          class="am-btn sm"
                          type="button"
                          :disabled="batchSaving"
                          @click.stop="batchGroupStatus(g, 'PUBLISHED')"
                        >
                          批量上架
                        </button>
                        <button
                          class="am-btn sm"
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
                  v-for="(item, idx) in expanded.has(g.key) ? g.rows : []"
                  :key="item.id"
                  :class="{
                    dragging: dragState?.type === 'item' && dragState?.id === item.id,
                    'drop-target': dropTarget === `item:${item.id}`,
                  }"
                  @dragover.prevent="onItemDragOver(g, item)"
                  @dragleave="onItemDragLeave(item.id)"
                  @drop.prevent="onItemDrop(g, item)"
                >
                  <td>
                    <input
                      class="am-cb"
                      type="checkbox"
                      :checked="selectedIds.has(item.id)"
                      @change="toggleSelect(item.id, ($event.target as HTMLInputElement).checked)"
                    />
                  </td>
                  <td>
                    <div class="style-name">
                      <span
                        class="drag-handle"
                        draggable="true"
                        title="拖动排序，或使用 ↑↓"
                        @dragstart="onItemDragStart($event, g.key, item.id)"
                        @dragend="clearDrag"
                        >⠿</span
                      >
                      <div class="row-order">
                        <button
                          class="am-btn xs"
                          type="button"
                          title="上移"
                          @click.stop.prevent="moveItem(g.key, item.id, -1)"
                        >
                          ↑
                        </button>
                        <button
                          class="am-btn xs"
                          type="button"
                          title="下移"
                          @click.stop.prevent="moveItem(g.key, item.id, 1)"
                        >
                          ↓
                        </button>
                      </div>
                      <span class="style-no">{{ String(idx + 1).padStart(2, '0') }}</span>
                      <div>
                        <b>{{ item.style }}</b>
                        <div class="t-sub">{{ (item.tags ?? []).join(' · ') || item.title }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="plat">{{ (item.platform ?? 'web').toUpperCase() }}</span></td>
                  <td>
                    <span class="st" :class="item.status === 'PUBLISHED' ? 'pub' : 'draft'">
                      <i></i>{{ item.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                    </span>
                  </td>
                  <td class="date hide-sm">{{ item.publishedAt ?? item.createdAt }}</td>
                  <td>
                    <div class="ops">
                      <a class="op" :href="`/prompts/${item.id}`" target="_blank" rel="noopener">预览</a>
                      <RouterLink
                        class="op"
                        :to="{ name: 'admin-entry-edit', params: { id: String(item.id) } }"
                      >
                        编辑
                      </RouterLink>
                      <button class="op pub" type="button" @click="onToggleStatus(item)">
                        {{ item.status === 'PUBLISHED' ? '下架' : '发布' }}
                      </button>
                      <button class="op warn" type="button" @click="onRemove(item)">删除</button>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="!visibleGroups.length && !loading">
                <td colspan="6" class="empty-cell">没有符合条件的提示词，试试切换状态或清空搜索。</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>显示 <b>{{ visibleRows }}</b> / {{ entries.length }} 条 · {{ visibleGroups.length }} 个分组</span>
          <span>提示词 {{ publishedCount }} · 草稿 {{ draftCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { pageEntries, removeEntry, updateEntryOrder, updateEntryStatus } from '@/api/entry'

import type { Entry, EntryStatus } from '@/types'

const router = useRouter()
type StatusFilter = 'all' | EntryStatus
type SortMode = 'desc' | 'asc' | 'manual'

/** 全量条目（个人站量级一次取回；筛选/排序/分组均在前端完成，保证组内排序整体生效） */
const entries = ref<Entry[]>([])
const loading = ref(false)
const statusFilter = ref<StatusFilter>('all')
const keyword = ref('')
const sortMode = ref<SortMode>('manual')
/** 展开的分组 key 集合；默认全部折叠，由用户手动展开 */
const expanded = ref<Set<string>>(new Set())
/** 已勾选的条目 id */
const selectedIds = ref<Set<number>>(new Set())
const batchSaving = ref(false)

/* ===== 手动排序：完整顺序存在后端 sort 字段 ===== */
/** 当前全量条目的展示顺序（id 数组，跨分组连续） */
const manualOrder = ref<number[]>([])
const savingOrder = ref(false)

/** 与后端一致的分组 key：大类 + 共享标题 */
function groupKeyOf(entry: Entry): string {
  return `${entry.categoryId ?? 0}::${entry.title}`
}

/** 状态 tab 计数：全部/已发布/草稿按条目数统计（原型 refreshTabCounts 口径） */
const publishedCount = computed(() => entries.value.filter((e) => e.status === 'PUBLISHED').length)
const draftCount = computed(() => entries.value.length - publishedCount.value)
const statusTabs = computed(() => [
  { value: 'all' as StatusFilter, label: '全部', count: entries.value.length },
  { value: 'PUBLISHED' as StatusFilter, label: '已发布', count: publishedCount.value },
  { value: 'DRAFT' as StatusFilter, label: '草稿', count: draftCount.value },
])

/** 状态 + 关键词过滤后的条目 */
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return entries.value.filter((e) => {
    if (statusFilter.value !== 'all' && e.status !== statusFilter.value) return false
    if (!kw) return true
    return [e.title, e.style, e.summary, ...(e.tags ?? [])]
      .join(' ')
      .toLowerCase()
      .includes(kw)
  })
})

interface Group {
  key: string
  name: string
  rows: Entry[]
  latest: string
  minId: number
}

/** 手动顺序中的位置；未出现的条目排到最后 */
function orderIndex(id: number): number {
  const index = manualOrder.value.indexOf(id)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

/** 按 (大类, 共享标题) 分组；手动模式按后端 sort 顺序，其余按更新时间 */
const allGroups = computed<Group[]>(() => {
  const map = new Map<string, Group>()
  for (const item of filtered.value) {
    const key = groupKeyOf(item)
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: item.categoryName || item.title,
        rows: [],
        latest: '',
        minId: item.id,
      })
    }
    const g = map.get(key)!
    g.rows.push(item)
    g.minId = Math.min(g.minId, item.id)
  }
  const groups = [...map.values()]
  for (const g of groups) {
    if (sortMode.value === 'manual') {
      g.rows.sort((a, b) => {
        const ia = orderIndex(a.id)
        const ib = orderIndex(b.id)
        if (ia !== ib) return ia - ib
        return a.id - b.id
      })
    } else {
      g.rows.sort((a, b) => {
        const da = a.publishedAt ?? a.createdAt ?? ''
        const db = b.publishedAt ?? b.createdAt ?? ''
        return sortMode.value === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
      })
    }
    g.latest = g.rows.reduce(
      (max, e) => ((e.publishedAt ?? e.createdAt ?? '') > max ? (e.publishedAt ?? e.createdAt ?? '') : max),
      '',
    )
  }
  return groups.sort((a, b) => {
    if (sortMode.value === 'manual') {
      const ia = Math.min(...a.rows.map((row) => orderIndex(row.id)))
      const ib = Math.min(...b.rows.map((row) => orderIndex(row.id)))
      if (ia !== ib) return ia - ib
    }
    return a.minId - b.minId
  })
})

const visibleGroups = computed(() => allGroups.value)
const visibleRows = computed(() => filtered.value.length)
const allExpanded = computed(
  () => visibleGroups.value.length > 0 && visibleGroups.value.every((g) => expanded.value.has(g.key)),
)

/* ===== 勾选与批量 ===== */
const allVisibleSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((e) => selectedIds.value.has(e.id)),
)
const someVisibleSelected = computed(
  () => filtered.value.some((e) => selectedIds.value.has(e.id)) && !allVisibleSelected.value,
)

function isGroupAllSelected(g: Group): boolean {
  return g.rows.length > 0 && g.rows.every((row) => selectedIds.value.has(row.id))
}

function isGroupSomeSelected(g: Group): boolean {
  const hit = g.rows.some((row) => selectedIds.value.has(row.id))
  return hit && !isGroupAllSelected(g)
}

function toggleSelect(id: number, checked: boolean): void {
  const next = new Set(selectedIds.value)
  if (checked) next.add(id)
  else next.delete(id)
  selectedIds.value = next
}

function toggleGroupSelection(g: Group, checked: boolean): void {
  const next = new Set(selectedIds.value)
  for (const row of g.rows) {
    if (checked) next.add(row.id)
    else next.delete(row.id)
  }
  selectedIds.value = next
}

function toggleSelectAll(checked: boolean): void {
  const next = new Set(selectedIds.value)
  for (const row of filtered.value) {
    if (checked) next.add(row.id)
    else next.delete(row.id)
  }
  selectedIds.value = next
}

function clearSelection(): void {
  selectedIds.value = new Set()
}

/** 批量上架 / 下架：逐条调用状态接口，全部成功后刷新 */
async function batchStatus(status: EntryStatus, ids?: number[]): Promise<void> {
  const targetIds = ids ?? [...selectedIds.value]
  if (!targetIds.length) return
  batchSaving.value = true
  try {
    await Promise.all(targetIds.map((id) => updateEntryStatus(id, status)))
    ElMessage.success(
      status === 'PUBLISHED' ? `已批量上架 ${targetIds.length} 条` : `已批量下架 ${targetIds.length} 条`,
    )
    clearSelection()
    await load()
  } finally {
    batchSaving.value = false
  }
}

/** 父条目右侧的批量操作：作用于该分组全部条目 */
function batchGroupStatus(g: Group, status: EntryStatus): void {
  const ids = entries.value.filter((e) => groupKeyOf(e) === g.key).map((e) => e.id)
  void batchStatus(status, ids)
}

/** 分组上移/下移：按手动顺序里的分组块交换 */
function moveGroup(key: string, dir: -1 | 1): void {
  const blocks: Array<{ key: string; ids: number[] }> = []
  const indexByKey = new Map<string, number>()
  for (const id of manualOrder.value) {
    const entry = entries.value.find((e) => e.id === id)
    if (!entry) continue
    const k = groupKeyOf(entry)
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
  void persistOrder(true)
}

/** 条目上移/下移：只在该分组内部交换相邻位置 */
function moveItem(key: string, id: number, dir: -1 | 1): void {
  const idsInGroup = manualOrder.value.filter((x) => {
    const entry = entries.value.find((e) => e.id === x)
    return entry !== undefined && groupKeyOf(entry) === key
  })
  const i = idsInGroup.indexOf(id)
  const j = i + dir
  if (i === -1 || j < 0 || j >= idsInGroup.length) return
  const a = manualOrder.value.indexOf(idsInGroup[i])
  const b = manualOrder.value.indexOf(idsInGroup[j])
  const next = [...manualOrder.value]
  const tmp = next[a]
  next[a] = next[b]
  next[b] = tmp
  manualOrder.value = next
  sortMode.value = 'manual'
  void persistOrder(true)
}

/* ===== 拖拽排序 ===== */
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

function onGroupDragStart(event: DragEvent, key: string): void {
  dragState.value = { type: 'group', key }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', key)
  }
}

function onGroupDragOver(key: string): void {
  if (dragState.value?.type === 'group' && dragState.value.key !== key) {
    dropTarget.value = `group:${key}`
  }
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
  const idsOf = (gid: string): Set<number> =>
    new Set(entries.value.filter((e) => groupKeyOf(e) === gid).map((e) => e.id))
  const moving = idsOf(drag.key)
  const block = manualOrder.value.filter((id) => moving.has(id))
  const rest = manualOrder.value.filter((id) => !moving.has(id))
  const targetIds = idsOf(key)
  const insertAt = rest.findIndex((id) => targetIds.has(id))
  manualOrder.value =
    insertAt === -1
      ? [...rest, ...block]
      : [...rest.slice(0, insertAt), ...block, ...rest.slice(insertAt)]
  sortMode.value = 'manual'
  void persistOrder(true)
  clearDrag()
}

function onItemDragStart(event: DragEvent, key: string, id: number): void {
  dragState.value = { type: 'item', key, id }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
  }
}

function onItemDragOver(g: Group, item: Entry): void {
  const drag = dragState.value
  if (!drag || drag.type !== 'item' || drag.key !== g.key || drag.id === item.id) return
  dropTarget.value = `item:${item.id}`
}

function onItemDragLeave(id: number): void {
  if (dropTarget.value === `item:${id}`) dropTarget.value = null
}

function onItemDrop(g: Group, item: Entry): void {
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
  if (drag.id === item.id) {
    clearDrag()
    return
  }
  const from = manualOrder.value.indexOf(drag.id)
  const to = manualOrder.value.indexOf(item.id)
  if (from !== -1 && to !== -1) {
    const next = [...manualOrder.value]
    next.splice(from, 1)
    const insertAt = next.indexOf(item.id)
    next.splice(insertAt === -1 ? next.length : insertAt, 0, drag.id)
    manualOrder.value = next
    sortMode.value = 'manual'
    void persistOrder(true)
  }
  clearDrag()
}

/** 把当前手动顺序提交到后端；失败时回读服务端顺序 */
async function persistOrder(showToast = false): Promise<void> {
  if (savingOrder.value) return
  savingOrder.value = true
  try {
    await updateEntryOrder(manualOrder.value)
    const sortMap = new Map(manualOrder.value.map((id, index) => [id, (index + 1) * 10]))
    entries.value = entries.value.map((entry) => ({ ...entry, sort: sortMap.get(entry.id) ?? entry.sort }))
    if (showToast) ElMessage.success('顺序已保存')
  } catch {
    await load()
  } finally {
    savingOrder.value = false
  }
}

/** 用后端 sort 初始化全量顺序 */
function applyServerOrder(): void {
  const sorted = [...entries.value].sort((a, b) => {
    const sa = a.sort ?? 0
    const sb = b.sort ?? 0
    if (sa !== sb) return sa - sb
    return a.id - b.id
  })
  manualOrder.value = sorted.map((entry) => entry.id)
}

/** 首次加载不清空展开状态；默认由空 Set 保证全部折叠 */
async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await pageEntries({ page: 1, size: 200 })
    entries.value = data.list
    applyServerOrder()
  } finally {
    loading.value = false
  }
}

function toggleGroup(key: string): void {
  const next = new Set(expanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expanded.value = next
}

function toggleAll(): void {
  expanded.value = allExpanded.value
    ? new Set()
    : new Set(visibleGroups.value.map((g) => g.key))
}

async function onToggleStatus(item: Entry): Promise<void> {
  const next: EntryStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
  await updateEntryStatus(item.id, next)
  ElMessage.success(next === 'PUBLISHED' ? '已发布' : '已转为草稿')
  await load()
}

async function onRemove(item: Entry): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除「${item.title}／${item.style}」？此操作不可恢复。`, '删除案例', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  await removeEntry(item.id)
  selectedIds.value.delete(item.id)
  selectedIds.value = new Set(selectedIds.value)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-head {
  padding: 40px 32px 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.page-head h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-head p {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--ink-2);
}

/* ===== 工具条：原型 admin-entries.html .toolbar ===== */
.am-toolbar {
  padding: 0 32px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0;
}

.am-tabs {
  display: flex;
  gap: 4px;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 3px;
  background: var(--paper-2);
}

.am-tabs button {
  border: 0;
  background: transparent;
  padding: 6px 13px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.am-tabs button.on {
  background: var(--ink);
  color: var(--paper-2);
}

.am-cnt {
  font-family: var(--font-mono);
  font-size: 9.5px;
  opacity: 0.6;
  margin-left: 3px;
}

.am-spacer {
  flex: 1;
}

.am-btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-size: 12.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: 0.15s;
  white-space: nowrap;
}

.am-btn:hover {
  border-color: var(--ink);
}

.am-btn.sm {
  height: 30px;
  font-size: 12px;
}

.am-btn.xs {
  height: 24px;
  padding: 0 7px;
  font-size: 11px;
  line-height: 1;
}

.g-order,
.row-order {
  display: flex;
  gap: 4px;
  flex: 0 0 auto;
}

.am-search {
  width: 220px;
  flex-shrink: 0;
}

.am-search input {
  width: 100%;
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--paper-2);
  font-size: 13px;
  color: var(--ink);
  outline: none;
  transition: 0.2s;
}

.am-search input:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1);
}

.panel-wrap {
  padding: 0 32px;
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 500;
  padding: 12px 18px;
  border-bottom: 1px solid var(--line);
  background: #fcfbf8;
}

td {
  padding: 12px 18px;
  border-bottom: 1px dashed var(--line);
  font-size: 13.5px;
  vertical-align: middle;
}

/* 分组头：整行可点，箭头随展开旋转 */
.grp-row td {
  padding: 0;
}

.grp-row.open .g-chevron {
  transform: rotate(90deg);
}

/* 分组头：拖拽手柄 + 勾选 + 展开按钮 + 批量上下架 */
.g-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 10px;
}

.g-head .g-toggle {
  width: auto;
  flex: 1;
  padding: 9px 6px;
}

.g-head .g-toggle:hover {
  background: transparent;
}

.g-batch {
  display: flex;
  gap: 6px;
  flex: 0 0 auto;
}

.g-batch .am-btn {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.am-cb {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  accent-color: var(--red);
  cursor: pointer;
}

.drag-handle {
  flex: 0 0 auto;
  cursor: grab;
  user-select: none;
  color: var(--ink-3);
  font-size: 14px;
  line-height: 1;
  padding: 2px;
}

.drag-handle:active {
  cursor: grabbing;
}

tr.dragging {
  opacity: 0.4;
}

tr.drop-target {
  background: rgba(192, 57, 43, 0.06);
}

tr.drop-target td {
  border-top: 2px solid var(--red);
}

/* 勾选后出现的批量操作条 */
.am-batch {
  margin: 0 32px 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid color-mix(in srgb, var(--red) 26%, var(--line));
  border-radius: 10px;
  background: color-mix(in srgb, var(--red) 5%, var(--paper-2));
  font-size: 12px;
}

.am-batch b {
  color: var(--red);
}

.am-batch .am-btn {
  height: 28px;
  padding: 0 10px;
  font-size: 11px;
}

.g-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  padding: 13px 16px;
  transition: background 0.2s;
  color: var(--ink);
  font-size: 13.5px;
}

.g-toggle:hover {
  background: rgba(192, 57, 43, 0.04);
}

.g-chevron {
  font-size: 11px;
  color: var(--ink-3);
  transition: transform 0.2s;
}

.g-toggle b {
  font-weight: 650;
}

.g-count,
.g-latest {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: var(--ink-3);
}

.g-latest {
  margin-left: auto;
}

.style-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.style-no {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-3);
  flex-shrink: 0;
}

.style-name b {
  font-weight: 600;
  display: block;
  line-height: 1.4;
}

.t-sub {
  font-size: 11.5px;
  color: var(--ink-2);
  margin-top: 2px;
}

.plat {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 2px 7px;
}

.st {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
}

.st i {
  font-style: normal;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.st.pub {
  color: #2f9e44;
  background: rgba(47, 158, 68, 0.1);
}

.st.pub i {
  background: #2f9e44;
}

.st.draft {
  color: var(--ink-2);
  background: var(--bg);
  border: 1px solid var(--line);
}

.st.draft i {
  background: #cfc9bd;
}

.date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-2);
}

.ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.op {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.15s;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.op:hover {
  color: var(--accent-ink);
  border-color: var(--accent);
}

.op.pub {
  color: var(--accent-ink);
  border-color: var(--accent);
}

.op.warn:hover {
  color: #c0392b;
  border-color: #c0392b;
}

.empty-cell {
  text-align: center;
  color: var(--ink-2);
  padding: 48px 0;
}

.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
  font-size: 11px;
  color: var(--ink-3);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.table-foot b {
  color: var(--ink-2);
  font-weight: 500;
}

@media (max-width: 1020px) {
  .am-toolbar .am-search {
    width: 100%;
    flex: 1 1 100%;
  }
}

@media (max-width: 900px) {
  .hide-sm {
    display: none;
  }
}

@media (max-width: 760px) {
  .g-head {
    gap: 6px;
    padding: 2px 6px;
  }

  .g-batch .am-btn {
    padding: 0 7px;
    font-size: 10px;
  }

  .g-latest {
    display: none;
  }

  .am-batch {
    margin: 0 16px 12px;
    flex-wrap: wrap;
  }
}
</style>
