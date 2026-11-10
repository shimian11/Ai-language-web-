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

      <!-- 加载态 / 错误态 -->
      <div v-if="loading" class="empty"><p>正在加载…</p></div>
      <div v-else-if="error" class="empty">
        <p>{{ error }}</p>
        <button class="btn" type="button" @click="load">重新加载</button>
      </div>

      <!-- 第一级：横向公司时间线（只显示有已发布记录的节点） -->
      <section v-else-if="!current">
        <div v-if="visibleCompanies.length" class="htl">
          <button
            v-for="co in visibleCompanies"
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
        <div v-else class="empty"><p>还没有已发布的实习记录。</p></div>
        <p v-if="visibleCompanies.length" class="htl-hint">点击节点，进入该公司的时间线</p>
      </section>

      <!-- 第二级：公司竖向时间线 -->
      <section v-else>
        <div class="lv2-head">
          <div>
            <a class="lv2-back" href="javascript:void(0)" @click.prevent="currentKey = null">
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

        <div v-if="shownItems.length" class="timeline">
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
        <div v-else class="empty"><p>这家公司还没有已发布的记录。</p></div>

        <!-- 分页：每次加载 3 篇 -->
        <div class="load-more">
          <button v-if="restCount > 0" class="btn" type="button" @click="shown += PAGE_SIZE">
            加载更多（剩 {{ restCount }} 篇）
          </button>
          <span v-else-if="companyItems.length" class="load-done">已全部加载</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { listCompanies, listPublishedArticles } from '@/api/article'
import type { CompanyItem } from '@/api/article'
import type { Article } from '@/types'

/** 每页加载数量 */
const PAGE_SIZE = 3

/** 公司别名（第一级）与已发布实习记录 */
const companies = ref<CompanyItem[]>([])
const all = ref<Article[]>([])
const loading = ref(true)
const error = ref('')

/** 当前选中的公司 key（null = 停在第一级） */
const currentKey = ref<string | null>(null)

/** 排序方向与已显示条数 */
const order = ref<'asc' | 'desc'>('asc')
const shown = ref(PAGE_SIZE)

/** 拉取公司列表与已发布实习记录 */
async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [co, list] = await Promise.all([listCompanies(), listPublishedArticles('internship')])
    companies.value = co
    all.value = list
  } catch {
    error.value = '内容加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

/** 当前公司对象 */
const current = computed(() => companies.value.find((c) => c.key === currentKey.value) ?? null)

/** 某公司的已发布记录数（横向时间线计数） */
function countOf(key: string): number {
  return all.value.filter((a) => a.company === key).length
}

/** 只展示有已发布记录的节点：空节点（后台建了但没发文）不进前台时间线 */
const visibleCompanies = computed(() => companies.value.filter((c) => countOf(c.key) > 0))

/** 当前公司的全部记录（接口已按日期倒序，正序需反转） */
const companyItems = computed<Article[]>(() => {
  const list = all.value.filter((a) => a.company === currentKey.value)
  return order.value === 'asc' ? [...list].reverse() : list
})

/** 按当前排序方向取前 shown 条 */
const shownItems = computed<Article[]>(() => companyItems.value.slice(0, shown.value))

/** 剩余未加载条数 */
const restCount = computed(() => Math.max(0, companyItems.value.length - shown.value))

/** 进入某公司：重置排序与分页 */
function openCompany(key: string): void {
  currentKey.value = key
  order.value = 'asc'
  shown.value = PAGE_SIZE
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 切换正/倒序：重置分页 */
function toggleOrder(): void {
  order.value = order.value === 'asc' ? 'desc' : 'asc'
  shown.value = PAGE_SIZE
}

onMounted(load)
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
