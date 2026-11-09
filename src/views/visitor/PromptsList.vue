<template>
  <!-- 提示词列表：标签自动聚合 + 平台 + 搜索 + 排序（分类由标签派生，无需手工维护） -->
  <div class="visitor-page">
    <main class="container-v page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span><b>提示词</b>
      </div>

      <div class="page-head">
        <div class="kicker">Prompt Library</div>
        <h1 class="page-title">提示词</h1>
        <p class="page-desc">
          把「想要的效果」拆成可复现的指令。每条都附 HTML 源码与实时预览，复制即可在自己的项目里跑起来。
        </p>
      </div>

      <div class="filters">
        <!-- 标签筛选：由已发布内容自动聚合（Top 7 + 更多展开） -->
        <div class="filter-row">
          <span class="filter-label">标签</span>
          <div ref="tagRowRef" class="tag-chips"></div>
        </div>
        <!-- 平台筛选：web / app / general（通用会被 web/app 命中） -->
        <div class="filter-row">
          <span class="filter-label">平台</span>
          <button
            v-for="p in platChips"
            :key="p.key"
            type="button"
            class="chip"
            :class="{ on: plat === p.key }"
            @click="plat = p.key"
          >
            {{ p.label }}
          </button>
          <input
            v-model="keyword"
            class="search"
            type="text"
            placeholder="搜索标题、样式或标签…"
          />
        </div>
        <!-- 排序：按更新时间 -->
        <div class="filter-row">
          <span class="filter-label">排序</span>
          <div class="tabs">
            <button type="button" :class="{ on: sortDir === 'desc' }" @click="sortDir = 'desc'">
              最新优先
            </button>
            <button type="button" :class="{ on: sortDir === 'asc' }" @click="sortDir = 'asc'">
              最早优先
            </button>
          </div>
        </div>
      </div>
      <p class="filter-note">标签由已发布内容自动聚合，无需手工维护分类 · 点击卡片上的标签可直接筛选</p>

      <!-- 案例卡片网格 -->
      <div v-if="visible.length" class="front-grid cols-3">
        <RouterLink
          v-for="entry in visible"
          :key="entry.id"
          class="card prompt-card"
          :to="`/prompts/${entry.id}`"
        >
          <div class="thumb">
            <div class="art-grid"></div>
            <!-- CSS 微缩示意封面：按标题稳定哈希选一种布局，列表页零 iframe -->
            <div class="cover">
              <span
                v-for="(s, si) in coverShapes(entry.title)"
                :key="si"
                :class="s.cls"
                :style="s.style"
              ></span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-cat">{{ entry.tags[0] || '提示词' }} · {{ entry.style }}</div>
            <div class="card-title">{{ entry.title }}</div>
            <div class="card-desc">{{ entry.summary }}</div>
            <div class="tags">
              <span
                v-for="t in entry.tags"
                :key="t"
                class="tag"
                @click.prevent.stop="selectTag(t)"
              >
                {{ t }}
              </span>
            </div>
            <div class="card-foot">
              <span>{{ entry.viewCount ?? 0 }} 浏览 · {{ entry.copyCount ?? 0 }} 复制</span>
              <span>查看 →</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- 空态 -->
      <div v-else class="empty">
        <p>没有符合条件的提示词，试试切换标签、平台或清空搜索。</p>
        <button class="btn primary" type="button" @click="resetFilters">重置筛选</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { pageEntries } from '@/api/entry'
import type { Entry } from '@/types'

/** 全量已发布条目（个人站量级一次取回；标签自动聚合与搜索在前端完成，后端同时提供 tag 精确筛选供大数量级使用） */
const entries = ref<Entry[]>([])
const loading = ref(true)

/** 平台筛选 chips */
const platChips = [
  { key: 'all', label: '全部' },
  { key: 'web', label: 'Web' },
  { key: 'app', label: 'App' },
  { key: 'general', label: '通用' },
] as const

/** 筛选与排序状态 */
const plat = ref<string>('all')
const keyword = ref('')
const sortDir = ref<'desc' | 'asc'>('desc')
/** 当前选中的标签（空串 = 全部） */
const activeTag = ref('')

/** 标签计数（按出现次数聚合，倒序） */
const tagCounts = computed<Array<[string, number]>>(() => {
  const map = new Map<string, number>()
  for (const e of entries.value) {
    for (const t of e.tags ?? []) map.set(t, (map.get(t) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

/** 标签 chip 是否展开「更多」 */
const tagExpanded = ref(false)
const TAG_LIMIT = 7

/** 平台筛选语义：web → web+general；app → app+general；general → 仅 general */
function matchPlat(entry: Entry): boolean {
  if (plat.value === 'all') return true
  const p = entry.platform ?? 'web'
  if (plat.value === 'general') return p === 'general'
  return p === plat.value || p === 'general'
}

/** 筛选 + 排序后的可见列表 */
const visible = computed<Entry[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  return entries.value
    .filter((e) => matchPlat(e))
    .filter((e) => !activeTag.value || (e.tags ?? []).includes(activeTag.value))
    .filter(
      (e) =>
        !kw ||
        [e.title, e.style, e.summary, ...(e.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(kw),
    )
    .sort((a, b) => {
      const da = a.publishedAt ?? a.createdAt
      const db = b.publishedAt ?? b.createdAt
      return sortDir.value === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
    })
})

/** 点卡片上的标签 = 直接按该标签筛选并展开更多 */
function selectTag(tag: string): void {
  activeTag.value = tag
  tagExpanded.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 重置全部筛选 */
function resetFilters(): void {
  activeTag.value = ''
  plat.value = 'all'
  keyword.value = ''
  sortDir.value = 'desc'
}

/* ---------- CSS 微缩示意封面 ----------
   以标题哈希从 6 种布局中稳定取一种，形状词汇见 visitor.css .cover */
interface Shape {
  cls: string
  style: string
}
const COVER_VARIANTS: Shape[][] = [
  // 0：左对齐（左基线条组 + 右下红短线）
  [
    { cls: 'cv-bar', style: 'left:14%;top:26%;width:14%' },
    { cls: 'cv-bar', style: 'left:14%;top:38%;width:52%;height:9px' },
    { cls: 'cv-bar lite', style: 'left:14%;top:54%;width:44%' },
    { cls: 'cv-bar lite', style: 'left:14%;top:66%;width:36%' },
    { cls: 'cv-rule', style: 'right:12%;bottom:14%' },
  ],
  // 1：两端对齐（两端块 + 中点线）
  [
    { cls: 'cv-bar', style: 'left:12%;top:32%;width:30%;height:8px' },
    { cls: 'cv-pill', style: 'right:12%;top:27%;width:22%;height:16px' },
    { cls: 'cv-bar lite', style: 'left:12%;top:55%;width:76%;height:2px' },
    { cls: 'cv-bar lite', style: 'left:12%;top:74%;width:24%' },
    { cls: 'cv-bar lite', style: 'right:12%;top:74%;width:24%' },
  ],
  // 2：空态（虚线圆 + 文案 + 按钮）
  [
    { cls: 'cv-ring', style: 'left:50%;top:20%;width:44px;height:44px;transform:translateX(-50%)' },
    { cls: 'cv-bar', style: 'left:50%;top:55%;width:34%;transform:translateX(-50%)' },
    { cls: 'cv-bar lite', style: 'left:50%;top:68%;width:26%;transform:translateX(-50%)' },
    { cls: 'cv-pill', style: 'left:50%;top:80%;width:20%;height:18px;transform:translateX(-50%);background:rgba(36,31,26,.85);border-color:transparent' },
  ],
  // 3：搜索无结果（搜索胶囊 + 提示 + 朱红按钮）
  [
    { cls: 'cv-pill', style: 'left:50%;top:24%;width:56%;height:22px;transform:translateX(-50%)' },
    { cls: 'cv-bar', style: 'left:33%;top:31%;width:9px;height:9px;border-radius:50%' },
    { cls: 'cv-bar lite', style: 'left:50%;top:58%;width:40%;transform:translateX(-50%)' },
    { cls: 'cv-pill', style: 'left:50%;top:78%;width:26%;height:18px;transform:translateX(-50%);background:color-mix(in srgb, var(--red) 14%, #fff);border-color:color-mix(in srgb, var(--red) 40%, transparent)' },
  ],
  // 4：卡片分组（三联小卡 + 彩色顶条）
  [
    { cls: 'cv-bar', style: 'left:12%;top:22%;width:26%;height:7px' },
    { cls: 'cv-box', style: 'left:12%;top:38%;width:22%;height:40%' },
    { cls: 'cv-box', style: 'left:39%;top:38%;width:22%;height:40%' },
    { cls: 'cv-box', style: 'left:66%;top:38%;width:22%;height:40%' },
    { cls: 'cv-rule', style: 'left:14.5%;top:44%;width:12px' },
    { cls: 'cv-rule', style: 'left:41.5%;top:44%;width:12px;background:var(--green)' },
    { cls: 'cv-rule', style: 'left:68.5%;top:44%;width:12px;background:var(--gold)' },
  ],
  // 5：移动端吸顶（手机框 + 吸顶栏）
  [
    { cls: 'cv-box', style: 'left:50%;top:12%;width:34%;height:74%;transform:translateX(-50%);border-radius:12px' },
    { cls: 'cv-bar', style: 'left:36%;top:18%;width:28%;height:8px;background:rgba(36,31,26,.30)' },
    { cls: 'cv-bar lite', style: 'left:38%;top:34%;width:24%' },
    { cls: 'cv-bar lite', style: 'left:38%;top:45%;width:19%' },
    { cls: 'cv-rule', style: 'left:38%;top:58%;width:16px' },
  ],
]

/** 标题哈希 → 稳定选择封面变体 */
function coverShapes(title: string): Shape[] {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) % 997
  return COVER_VARIANTS[hash % COVER_VARIANTS.length]
}

/* ---------- 标签 chips：原生渲染（支持「更多 N」展开） ---------- */
const tagRowRef = ref<HTMLElement | null>(null)

/** 重绘标签 chips（全部/Top N/更多） */
function renderTagChips(): void {
  const row = tagRowRef.value
  if (!row) return
  const list = tagExpanded.value ? tagCounts.value : tagCounts.value.slice(0, TAG_LIMIT)
  const more = tagCounts.value.slice(TAG_LIMIT)
  const btn = (label: string, tag: string, count?: number) =>
    `<button type="button" class="chip${activeTag.value === tag ? ' on' : ''}" data-tag="${tag}">` +
    `${label}${count !== undefined ? ` <span class="chip-count">${count}</span>` : ''}</button>`
  row.innerHTML =
    btn('全部', '', entries.value.length) +
    list.map(([t, n]) => btn(t, t, n)).join('') +
    (more.length
      ? `<button type="button" class="chip" data-more>${tagExpanded.value ? '收起' : `更多 ${more.length} ▾`}</button>`
      : '')
}

/** 标签条点击委托：选标签 / 展开更多 */
function onTagRowClick(e: MouseEvent): void {
  const target = e.target as HTMLElement
  if (target.closest('[data-more]')) {
    tagExpanded.value = !tagExpanded.value
    renderTagChips()
    return
  }
  const chip = target.closest('[data-tag]') as HTMLElement | null
  if (!chip) return
  activeTag.value = chip.dataset.tag ?? ''
  renderTagChips()
}

onMounted(async () => {
  loading.value = true
  try {
    // 无 token 时后端强制只返回已发布（见后端 EntryController）
    const res = await pageEntries({ page: 1, size: 100 })
    entries.value = res.list
  } finally {
    loading.value = false
  }
  renderTagChips()
  tagRowRef.value?.addEventListener('click', onTagRowClick)
})
</script>

<style scoped>
.page-head {
  margin-bottom: 0;
}
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.filter-note {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--ink-3);
  margin: -14px 0 26px;
}
/* 卡片标签可点：筛选该标签 */
.prompt-card .tag {
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.prompt-card .tag:hover {
  color: var(--red);
  background: color-mix(in srgb, var(--red) 10%, var(--paper-3));
}
@media (max-width: 760px) {
  .filter-note {
    margin-top: 4px;
  }
}
</style>
