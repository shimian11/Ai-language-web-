<template>
  <!-- 我的收藏：本地 localStorage，四类 Tab（提示词/心得/实习/面试） -->
  <div class="visitor-page">
    <main class="container-v page-pad">
      <div class="crumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span><b>我的收藏</b>
      </div>

      <div class="page-head" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap">
        <div>
          <div class="kicker">Favorites</div>
          <h1 class="page-title">我的收藏</h1>
          <p class="page-desc">
            按内容类型分类的本地收藏（localStorage），不需要登录。清空浏览器数据会一并消失。
          </p>
        </div>
        <div style="display: flex; gap: 10px">
          <button class="btn sm" type="button" @click="restoreDemo">恢复示例</button>
          <button class="btn sm danger" type="button" @click="onClear">清空收藏</button>
        </div>
      </div>

      <!-- 类型 Tab（带计数） -->
      <div class="toolbar">
        <div class="tabs" role="tablist">
          <button
            v-for="t in typeTabs"
            :key="t.key"
            type="button"
            role="tab"
            :class="{ on: currentTab === t.key }"
            :aria-selected="currentTab === t.key ? 'true' : 'false'"
            @click="currentTab = t.key"
          >
            {{ t.label }} <span class="chip-count">{{ countByType[t.key] ?? 0 }}</span>
          </button>
        </div>
      </div>

      <!-- 收藏卡片 -->
      <div v-if="visible.length" class="front-grid cols-3">
        <div v-for="item in visible" :key="`${item.type}:${item.id}`" class="card">
          <RouterLink :to="linkOf(item)" style="display: block; color: inherit; text-decoration: none">
            <div class="thumb">
              <div class="art-grid"></div>
              <!-- 有封面用真实图，否则回落 CSS 示意图 -->
              <img v-if="item.cover" class="cover-img" :src="item.cover" alt="封面" loading="lazy" />
            </div>
            <div class="card-body">
              <div class="card-cat">
                <span class="badge" :class="typeMeta[currentTab].badge">{{ typeMeta[currentTab].label }}</span>
                {{ item.cat }}
              </div>
              <div class="card-title">{{ item.title }}</div>
              <div class="card-desc">{{ item.desc }}</div>
            </div>
          </RouterLink>
          <div style="padding: 0 20px 16px">
            <button class="btn sm ghost" type="button" style="color: var(--red)" @click="onRemove(item)">
              取消收藏
            </button>
          </div>
        </div>
      </div>

      <!-- 空态：引导去对应列表页 -->
      <div v-else class="empty">
        <p>{{ typeMeta[currentTab].empty }}</p>
        <RouterLink class="btn primary" :to="typeMeta[currentTab].list">
          去{{ typeMeta[currentTab].label }}页 →
        </RouterLink>
      </div>
    </main>

    <!-- 轻量 Toast -->
    <Teleport to="body">
      <div class="v-toast" :class="{ show: toastShow }">{{ toast }}</div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useFavorites } from '@/composables/useFavorites'
import type { FavItem, FavType } from '@/types'

const { favItems, countByType, remove, clear } = useFavorites()

/** 类型 Tab 配置：名称 / 徽标 / 列表入口 / 空态文案 */
const typeMeta: Record<FavType, { label: string; badge: string; list: string; empty: string }> = {
  prompt: { label: '提示词', badge: 'tp-prompt', list: '/prompts', empty: '去提示词页找几条能用的收进来。' },
  note: { label: '心得', badge: 'tp-note', list: '/notes', empty: '去心得页看看，遇到共鸣的再收。' },
  internship: { label: '实习', badge: 'tp-intern', list: '/internship', empty: '去实习时间线里挑几段经历收藏。' },
  interview: { label: '面试', badge: 'tp-interview', list: '/interview', empty: '去面试栏目里收藏有用的面经和题目。' },
}

/** Tab 顺序 */
const typeTabs = Object.entries(typeMeta).map(([key, meta]) => ({ key: key as FavType, label: meta.label }))

/** 当前 Tab（默认提示词） */
const currentTab = ref<FavType>('prompt')

/** 当前 Tab 下的收藏（倒序：后收藏的在前） */
const visible = computed(() =>
  [...favItems.value].reverse().filter((x) => x.type === currentTab.value),
)

/** 收藏条目详情链接：统一取类型配置里的列表路由（/prompts、/notes、/internship、/interview） */
function linkOf(item: FavItem): string {
  return `${typeMeta[item.type].list}/${item.id}`
}
/** Toast */
const toast = ref('')
const toastShow = ref(false)
let timer: number | undefined
function showToast(text: string): void {
  toast.value = text
  toastShow.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => (toastShow.value = false), 1400)
}

/** 取消收藏 */
function onRemove(item: FavItem): void {
  remove(item.type, item.id)
  showToast('已取消收藏')
}

/** 清空全部 */
function onClear(): void {
  if (!confirm('确定清空全部收藏？')) return
  clear()
  showToast('收藏已清空')
}

/** 恢复示例收藏（首次体验用） */
function restoreDemo(): void {
  const demo: FavItem[] = [
    { type: 'prompt', id: '1', cat: '首屏 · 左对齐', title: '内容左对齐：标题压在留白边缘', desc: '适合杂志感落地页，标题与正文沿同一条左基线排列。' },
    { type: 'note', id: '7', cat: 'AI 使用', title: '用 AI 做出第一版之后，我改了什么', desc: 'AI 给的 80 分页面只能当草稿，最后 20 分靠人的判断力。' },
    { type: 'interview', id: '8', cat: '算法题', title: '手写并发调度器（附测试思路）', desc: '一面挂过的题重写：队列 + 计数，边界条件逐个补齐。' },
  ]
  for (const item of demo) {
    if (!favItems.value.some((x) => x.type === item.type && x.id === item.id)) {
      favItems.value = [...favItems.value, item]
    }
  }
  localStorage.setItem('ai_lang_favs', JSON.stringify(favItems.value))
  showToast('已恢复示例收藏')
}
</script>

<style scoped>
.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
}
</style>
