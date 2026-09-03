<template>
  <div>
    <section class="hero">
      <div class="hero-copy">
        <h1>搜集<span>好提示词</span>，<br />复现好设计。</h1>
        <p>记录 AI 生成网页设计的效果与提示词，按设计模式与具体样式归档，随取随用。</p>
      </div>
      <div class="prompt-cards" aria-hidden="true">
        <div class="pc pc1"><i></i><b>中心聚焦型 · 大屏设计</b><span class="txt">深蓝底色，青色高亮，科幻指挥舱 HUD…</span></div>
        <div class="pc pc2"><i></i><b>3D 旋转木马 · 轮播</b><span class="txt">coverflow 透视景深，拖拽惯性…</span></div>
        <div class="pc pc3"><i></i><b>左右分栏 · 落地页</b><span class="txt">左文右图 5:7，浮动阴影…</span></div>
      </div>
    </section>

    <div class="filter-bar">
      <div class="filter-in">
        <CategoryPills v-model="entryStore.categoryId" :categories="categoryStore.list" />
      </div>
    </div>

    <main class="wrap">
      <PageSkeleton v-if="entryStore.loading" :count="8" />
      <template v-else>
        <div v-if="entryStore.list.length" class="masonry">
          <EntryCard
            v-for="entry in entryStore.list"
            :key="entry.id"
            :entry="entry"
            @open="openEntry(entry.id)"
          />
        </div>
        <EmptyState
          v-else
          title="没有符合条件的案例"
          description="换个分类或关键词试试，也可以清除筛选条件"
        >
          <el-button round @click="resetFilters">清除筛选</el-button>
        </EmptyState>

        <div v-if="entryStore.total > entryStore.size" class="pager">
          <AppPagination
            v-model:page="entryStore.page"
            v-model:size="entryStore.size"
            :total="entryStore.total"
            @change="entryStore.fetchEntries()"
          />
        </div>
      </template>
    </main>

    <footer>
      <div class="foot-in">AI 网页设计提示词库 · 暖调留白画廊风</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppPagination from '@/components/common/AppPagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import CategoryPills from '@/components/business/CategoryPills.vue'
import EntryCard from '@/components/business/EntryCard.vue'
import { useCategoryStore } from '@/stores/category'
import { useEntryStore } from '@/stores/entry'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const entryStore = useEntryStore()

// 分类选择同步到 URL query，支持刷新与分享
watch(
  () => entryStore.categoryId,
  (value) => {
    entryStore.page = 1
    entryStore.fetchEntries()
    router.replace({
      query: { ...route.query, category: value === undefined ? undefined : String(value) },
    })
  },
)

// 浏览器前进/后退时从 URL 恢复分类
watch(
  () => route.query.category,
  (value) => {
    const id = value === undefined ? undefined : Number(value)
    if (id !== entryStore.categoryId) {
      entryStore.categoryId = id !== undefined && !Number.isNaN(id) ? id : undefined
    }
  },
)

onMounted(() => {
  entryStore.status = 'PUBLISHED'
  const queryCategory = route.query.category
  if (queryCategory !== undefined) {
    const id = Number(queryCategory)
    if (!Number.isNaN(id)) entryStore.categoryId = id
  }
  if (!categoryStore.list.length) {
    categoryStore.fetchCategories()
  }
  entryStore.fetchEntries()
})

function openEntry(id: number): void {
  router.push({ name: 'entry-detail', params: { id: String(id) } })
}

function resetFilters(): void {
  entryStore.keyword = ''
  entryStore.categoryId = undefined
  entryStore.page = 1
  entryStore.fetchEntries()
}
</script>

<style scoped>
.hero {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero h1 {
  font-size: 40px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.hero h1 span {
  border-bottom: 6px solid var(--accent);
  padding-bottom: 2px;
}

.hero p {
  margin-top: 14px;
  color: var(--ink-2);
  font-size: 15px;
  max-width: 540px;
  line-height: 1.8;
}

.prompt-cards {
  position: relative;
  width: 360px;
  height: 216px;
  flex-shrink: 0;
}

.pc {
  position: absolute;
  width: 280px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 12px 28px rgba(26, 24, 21, 0.08);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
  color: var(--ink-2);
}

.pc b {
  display: block;
  color: var(--ink);
  font-size: 13px;
  margin-bottom: 4px;
  font-family: var(--font-sans);
  font-weight: 650;
}

.pc i {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
}

.pc .txt {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 230px;
}

.pc1 {
  top: 0;
  left: 28px;
  rotate: -4deg;
  z-index: 3;
}

.pc2 {
  top: 72px;
  left: 64px;
  rotate: 3deg;
  z-index: 2;
}

.pc3 {
  top: 144px;
  left: 20px;
  rotate: -2deg;
  z-index: 1;
}

@media (max-width: 900px) {
  .prompt-cards {
    display: none;
  }
  .hero {
    padding: 48px 32px 36px;
  }
}

.filter-bar {
  position: sticky;
  top: 64px;
  z-index: 40;
  background: rgba(250, 249, 246, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.filter-in {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 32px;
}

.wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 32px 40px;
}

.masonry {
  column-count: 4;
  column-gap: 20px;
}

@media (max-width: 1100px) {
  .masonry {
    column-count: 3;
  }
}

@media (max-width: 780px) {
  .masonry {
    column-count: 2;
  }
}

.masonry > * {
  break-inside: avoid;
  margin-bottom: 20px;
}

.pager {
  display: flex;
  justify-content: center;
  padding: 8px 0 24px;
}

footer {
  border-top: 1px solid var(--line);
  padding: 28px 32px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-2);
}
</style>
