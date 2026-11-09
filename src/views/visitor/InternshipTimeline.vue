<template>
  <!-- 实习：两级时间线 —— 横向选公司 → 竖向看记录（分页 3 篇/页 + 正倒序） -->
  <div class="visitor-page">
    <main class="container-v page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span><b>实习</b>
      </div>

      <div class="page-head">
        <div class="kicker">Internship Log</div>
        <h1 class="page-title">实习</h1>
        <p class="page-desc">
          先在横向时间线上选择一段经历，再进入该公司的时间线逐条阅读。公司名已做脱敏，过程不做美化。
        </p>
      </div>

      <!-- 第一级：横向公司时间线 -->
      <section v-if="!current">
        <div class="htl">
          <button
            v-for="co in companies"
            :key="co.key"
            type="button"
            class="htl-node"
            :class="{ milestone: co.milestone }"
            @click="openCompany(co.key)"
          >
            <span class="htl-dot"></span>
            <span class="htl-name">{{ co.name }}</span>
            <span class="htl-sub">{{ co.meta }}</span>
            <span class="htl-count">{{ countOf(co.key) }} 篇</span>
          </button>
        </div>
        <p class="htl-hint">点击节点，进入该公司的时间线</p>
      </section>

      <!-- 第二级：公司竖向时间线 -->
      <section v-else>
        <div class="lv2-head">
          <div>
            <a class="lv2-back" href="javascript:void(0)" @click.prevent="current = null">
              ← 返回公司时间线
            </a>
            <h2 class="lv2-title">{{ current.name }}</h2>
            <div class="lv2-sub">{{ current.meta }} · {{ companyItems.length }} 篇记录</div>
          </div>
          <div class="lv2-actions">
            <!-- 正/倒序切换 -->
            <button class="btn sm" type="button" @click="toggleOrder">
              {{ order === 'asc' ? '时间正序 ↓' : '时间倒序 ↑' }}
            </button>
            <span class="htl-count">{{ companyItems.length }} 篇</span>
          </div>
        </div>

        <div class="timeline">
          <RouterLink
            v-for="it in shownItems"
            :key="it.id"
            class="t-item"
            :to="`/internship/${it.id}`"
          >
            <span class="t-date">{{ it.date }}</span>
            <span class="t-dot"></span>
            <span class="t-body">
              <span class="t-title">{{ it.title }}</span>
              <span class="t-desc">{{ it.summary }}</span>
              <span class="t-meta">{{ it.date }} · {{ it.sub }}</span>
            </span>
          </RouterLink>
        </div>

        <!-- 分页：每次加载 3 篇 -->
        <div class="load-more">
          <button v-if="restCount > 0" class="btn" type="button" @click="shown += PAGE_SIZE">
            加载更多（剩 {{ restCount }} 篇）
          </button>
          <span v-else class="load-done">已全部加载</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { INTERNSHIP_COMPANIES, listPublished } from '@/mocks/articles'
import type { Article } from '@/types'

/** 每页加载数量 */
const PAGE_SIZE = 3

/** 公司配置（含里程碑节点） */
const companies = INTERNSHIP_COMPANIES

/** 当前选中的公司（null = 停在第一级） */
const current = ref<(typeof companies)[number] | null>(null)

/** 排序方向与已显示条数 */
const order = ref<'asc' | 'desc'>('asc')
const shown = ref(PAGE_SIZE)

/** 全部已发布实习记录 */
const all = listPublished('internship')

/** 某公司的记录数（横向时间线计数） */
function countOf(key: string): number {
  return all.filter((a) => a.company === key).length
}

/** 当前公司的全部记录（按正序） */
const companyItems = computed<Article[]>(() =>
  all.filter((a) => a.company === current.value?.key),
)

/** 按当前排序方向取前 shown 条（倒序即整表反转后再截取） */
const shownItems = computed<Article[]>(() => {
  const list =
    order.value === 'asc' ? companyItems.value : [...companyItems.value].reverse()
  return list.slice(0, shown.value)
})

/** 剩余未加载条数 */
const restCount = computed(() => Math.max(0, companyItems.value.length - shown.value))

/** 进入某公司：重置排序与分页 */
function openCompany(key: string): void {
  current.value = companies.find((c) => c.key === key) ?? null
  order.value = 'asc'
  shown.value = PAGE_SIZE
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 切换正/倒序：重置分页 */
function toggleOrder(): void {
  order.value = order.value === 'asc' ? 'desc' : 'asc'
  shown.value = PAGE_SIZE
}
</script>

<style scoped>
.htl-hint {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-3);
  letter-spacing: 0.14em;
  margin-top: 30px;
}
.lv2-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 6px 0 26px;
  flex-wrap: wrap;
}
.lv2-back {
  font-size: 12.5px;
  color: var(--ink-2);
  text-decoration: none;
}
.lv2-back:hover {
  color: var(--red);
}
.lv2-title {
  font-family: var(--serif);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin: 10px 0 0;
}
.lv2-sub {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--ink-3);
  letter-spacing: 0.08em;
  margin-top: 6px;
}
.lv2-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.load-more {
  text-align: center;
  margin-top: 30px;
}
.load-done {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-3);
  letter-spacing: 0.14em;
}
</style>
