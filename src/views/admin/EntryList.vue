<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>案例管理</h1>
        <p>全部提示词案例的发布、下架与维护</p>
      </div>
      <el-button type="primary" round size="large" @click="router.push({ name: 'admin-entry-new' })">
        ＋ 发布新提示词
      </el-button>
    </div>

    <div class="filters">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        class="tab"
        :class="{ on: statusFilter === tab.value }"
        type="button"
        @click="onTabChange(tab.value)"
      >
        {{ tab.label }} <span class="n">{{ tab.count }}</span>
      </button>
      <div class="search">
        <input v-model="keyword" type="text" placeholder="搜索案例标题…" @keyup.enter="onSearch" />
      </div>
    </div>

    <div class="panel-wrap">
      <div class="panel">
        <!-- 分组视图：按「设计大类-案例标题」统计 -->
        <template v-if="view === 'groups'">
          <table>
            <thead>
              <tr>
                <th style="width: 60%">案例分组</th>
                <th>样式数</th>
                <th class="hide-sm">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in groups" :key="`${g.categoryId}:${g.title}`" class="grp-row" @click="openGroup(g)">
                <td>
                  <div class="e-title">
                    <Thumb :src="g.cover ?? ''" :text="g.categoryName" class="e-thumb" />
                    <span>
                      <b>{{ g.categoryName }} - {{ g.title }}</b>
                      <span class="cat">点击进入查看该组全部样式</span>
                    </span>
                  </div>
                </td>
                <td><span class="num">{{ g.count }}</span></td>
                <td class="hide-sm"><span class="hint">→</span></td>
              </tr>
              <tr v-if="!groups.length && !loading">
                <td colspan="3" class="empty-cell">没有符合条件的案例分组</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- 组内视图：该组各样式按「样式名称」命名 -->
        <template v-else-if="activeGroup">
          <div class="group-bar">
            <button class="back" type="button" @click="backToGroups">← 返回分组列表</button>
            <span class="gb-title">{{ activeGroup.categoryName }} - {{ activeGroup.title }}</span>
            <span class="no">共 {{ total }} 个样式</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 38%">样式</th>
                <th>状态</th>
                <th class="hide-sm">浏览</th>
                <th class="hide-sm">复制</th>
                <th class="hide-sm">收录日期</th>
                <th style="text-align: right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td>
                  <div class="e-title">
                    <Thumb :src="item.images[0]?.url ?? ''" :text="item.style" class="e-thumb" />
                    <span>
                      <b>{{ item.style }}</b>
                      <span class="cat">{{ item.categoryName }}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <span class="st" :class="item.status === 'PUBLISHED' ? 'pub' : 'draft'">
                    <i></i>{{ item.status === 'PUBLISHED' ? '已发布' : '草稿' }}
                  </span>
                </td>
                <td class="num hide-sm">{{ item.viewCount ?? 0 }}</td>
                <td class="num hide-sm">{{ item.copyCount ?? 0 }}</td>
                <td class="date hide-sm">{{ item.publishedAt ?? item.createdAt }}</td>
                <td>
                  <div class="ops">
                    <a class="op" :href="`/entry/${item.id}`" target="_blank" rel="noopener">预览</a>
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
              <tr v-if="!list.length && !loading">
                <td colspan="6" class="empty-cell">该组暂无案例</td>
              </tr>
            </tbody>
          </table>
          <div class="foot">
            <span>共 <b>{{ total }}</b> 条</span>
            <AppPagination
              v-model:page="page"
              v-model:size="size"
              :total="total"
              @change="fetchList"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import AppPagination from '@/components/common/AppPagination.vue'
import Thumb from '@/components/common/Thumb.vue'
import { entryGroups, pageEntries, removeEntry, updateEntryStatus } from '@/api/entry'

import type { Entry, EntryGroup, EntryStatus } from '@/types'

const router = useRouter()

type StatusFilter = 'all' | EntryStatus

const statusTabs = ref([
  { value: 'all' as StatusFilter, label: '全部', count: 0 },
  { value: 'PUBLISHED' as StatusFilter, label: '已发布', count: 0 },
  { value: 'DRAFT' as StatusFilter, label: '草稿', count: 0 },
])

const statusFilter = ref<StatusFilter>('all')
const keyword = ref('')
const loading = ref(false)

// 两级视图状态
const view = ref<'groups' | 'items'>('groups')
const groups = ref<EntryGroup[]>([])
const activeGroup = ref<EntryGroup | null>(null)
const list = ref<Entry[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const statusParam = (): EntryStatus | undefined =>
  statusFilter.value === 'all' ? undefined : statusFilter.value

async function fetchGroups(): Promise<void> {
  loading.value = true
  try {
    groups.value = await entryGroups({ status: statusParam(), keyword: keyword.value || undefined })
  } finally {
    loading.value = false
  }
}

async function fetchList(): Promise<void> {
  if (!activeGroup.value) return
  loading.value = true
  try {
    const data = await pageEntries({
      page: page.value,
      size: size.value,
      categoryId: activeGroup.value.categoryId,
      title: activeGroup.value.title,
      status: statusParam(),
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function fetchCounts(): Promise<void> {
  const [all, published, draft] = await Promise.all([
    entryGroups({}),
    entryGroups({ status: 'PUBLISHED' }),
    entryGroups({ status: 'DRAFT' }),
  ])
  statusTabs.value[0].count = all.length
  statusTabs.value[1].count = published.length
  statusTabs.value[2].count = draft.length
}

function openGroup(g: EntryGroup): void {
  activeGroup.value = g
  page.value = 1
  view.value = 'items'
  fetchList()
}

function backToGroups(): void {
  view.value = 'groups'
  activeGroup.value = null
  fetchGroups()
}

function onTabChange(value: StatusFilter): void {
  statusFilter.value = value
  page.value = 1
  if (view.value === 'groups') fetchGroups()
  else fetchList()
}

function onSearch(): void {
  page.value = 1
  view.value = 'groups'
  activeGroup.value = null
  fetchGroups()
}

async function onToggleStatus(item: Entry): Promise<void> {
  const next: EntryStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
  await updateEntryStatus(item.id, next)
  ElMessage.success(next === 'PUBLISHED' ? '已发布' : '已转为草稿')
  await fetchList()
}

async function onRemove(item: Entry): Promise<void> {
  try {
    await ElMessageBox.confirm(`确认删除「${item.title}」？此操作不可恢复。`, '删除案例', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  await removeEntry(item.id)
  ElMessage.success('已删除')
  await fetchList()
}

onMounted(() => {
  fetchGroups()
  fetchCounts()
})
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

.filters {
  padding: 0 32px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tab {
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  font-size: 13.5px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.tab:hover {
  color: var(--ink);
  border-color: var(--ink);
}

.tab.on {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
  font-weight: 600;
}

.tab .n {
  font-family: var(--font-mono);
  font-size: 11px;
  opacity: 0.75;
}

.search {
  flex: 1;
  max-width: 320px;
  margin-left: auto;
  position: relative;
}

.search input {
  width: 100%;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card);
  padding: 0 16px 0 36px;
  font-size: 13px;
  color: var(--ink);
  outline: none;
  transition: border 0.15s;
}

.search input:focus {
  border-color: var(--ink);
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

tr:hover td {
  background: #fcfaf6;
}

tr.grp-row {
  cursor: pointer;
}

.e-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.e-title .e-thumb {
  width: 52px;
  height: 39px;
  border-radius: 6px;
  border: 1px solid var(--line);
}

.e-title b {
  font-weight: 600;
  display: block;
  line-height: 1.4;
}

.e-title .cat {
  font-size: 11.5px;
  color: var(--ink-2);
  margin-top: 2px;
  display: block;
}

.hint {
  color: var(--ink-2);
  font-size: 15px;
}

.group-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.group-bar .back {
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  font-size: 12.5px;
  cursor: pointer;
  transition: 0.15s;
}

.group-bar .back:hover {
  border-color: var(--accent);
  color: var(--accent-ink);
}

.group-bar .gb-title {
  font-weight: 650;
  font-size: 14px;
}

.group-bar .no {
  font-size: 12px;
  color: var(--ink-2);
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

.num {
  font-family: var(--font-mono);
  font-size: 12.5px;
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

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  font-size: 12.5px;
  color: var(--ink-2);
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 900px) {
  .hide-sm {
    display: none;
  }
}
</style>