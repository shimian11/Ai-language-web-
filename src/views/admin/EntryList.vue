<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>案例管理</h1>
        <p>共 {{ entries.length }} 个提示词 · 点击分组标题展开/收起</p>
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
        <button type="button" :class="{ on: sortDir === 'desc' }" @click="sortDir = 'desc'">最新优先</button>
        <button type="button" :class="{ on: sortDir === 'asc' }" @click="sortDir = 'asc'">最早优先</button>
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

    <div class="panel-wrap">
      <div class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width: 46%">样式名称</th>
                <th>平台</th>
                <th>状态</th>
                <th class="hide-sm">更新时间</th>
                <th style="text-align: right">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 分组头与组内行在同一张表内就地折叠（原型：不做二级页面） -->
              <template v-for="g in visibleGroups" :key="g.key">
                <tr class="grp-row" :class="{ open: expanded.has(g.key) }">
                  <td colspan="5">
                    <button class="g-toggle" type="button" @click="toggleGroup(g.key)">
                      <span class="g-chevron">▶</span>
                      <b>{{ g.name }}</b>
                      <span class="g-count">{{ g.rows.length }} 条</span>
                      <span class="g-latest">最近更新 {{ g.latest || '暂无条目' }}</span>
                    </button>
                  </td>
                </tr>
                <tr v-for="(item, idx) in expanded.has(g.key) ? g.rows : []" :key="item.id">
                  <td>
                    <div class="style-name">
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
                <td colspan="5" class="empty-cell">没有符合条件的提示词，试试切换状态或清空搜索。</td>
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

import { pageEntries, removeEntry, updateEntryStatus } from '@/api/entry'

import type { Entry, EntryStatus } from '@/types'

const router = useRouter()
type StatusFilter = 'all' | EntryStatus

/** 全量条目（个人站量级一次取回；筛选/排序/分组均在前端完成，保证组内排序整体生效） */
const entries = ref<Entry[]>([])
const loading = ref(false)
const statusFilter = ref<StatusFilter>('all')
const keyword = ref('')
const sortDir = ref<'desc' | 'asc'>('desc')
/** 展开的分组 key 集合；默认展开首组（对齐原型） */
const expanded = ref<Set<string>>(new Set())

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

/** 按 (大类, 共享标题) 分组；组内按更新时间排序，组本身按最小 id 固定顺序 */
const allGroups = computed<Group[]>(() => {
  const map = new Map<string, Group>()
  for (const item of filtered.value) {
    const key = `${item.categoryId ?? 0}::${item.title}`
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
    g.rows.sort((a, b) => {
      const da = a.publishedAt ?? a.createdAt ?? ''
      const db = b.publishedAt ?? b.createdAt ?? ''
      return sortDir.value === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
    })
    g.latest = g.rows.reduce(
      (max, e) => ((e.publishedAt ?? e.createdAt ?? '') > max ? (e.publishedAt ?? e.createdAt ?? '') : max),
      '',
    )
  }
  return groups.sort((a, b) => a.minId - b.minId)
})

const visibleGroups = computed(() => allGroups.value)
const visibleRows = computed(() => filtered.value.length)
const allExpanded = computed(
  () => visibleGroups.value.length > 0 && visibleGroups.value.every((g) => expanded.value.has(g.key)),
)

/** 首次加载后默认展开首组 */
async function load(): Promise<void> {
  loading.value = true
  try {
    const data = await pageEntries({ page: 1, size: 200 })
    entries.value = data.list
    const first = allGroups.value[0]
    expanded.value = new Set(first ? [first.key] : [])
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
  align-items: baseline;
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
</style>
