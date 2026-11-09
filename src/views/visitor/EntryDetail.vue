<template>
  <!-- 提示词详情：entry 数据源 + HTML 实时演示 + 复制 + 收藏 -->
  <div class="visitor-page">
    <div class="container-v narrow page-pad">
      <PageSkeleton v-if="loading" :count="1" />

      <EmptyState
        v-else-if="notFound || !entry"
        title="案例不存在"
        description="它可能还未发布或已被删除"
      >
        <el-button round @click="router.push({ name: 'home' })">返回首页</el-button>
      </EmptyState>

      <template v-else>
        <!-- 面包屑：唯一返回路径 -->
        <div class="crumbs">
          <RouterLink to="/">首页</RouterLink><span>/</span>
          <RouterLink to="/prompts">提示词</RouterLink><span>/</span>
          <RouterLink :to="{ path: '/prompts', query: { tag: primaryTag } }">{{ primaryTag }}</RouterLink><span>/</span>
          <b>{{ entry.style }}</b>
        </div>

        <!-- 头部：标题 + 收藏按钮同行 -->
        <div class="article-head" style="border: 0; padding-top: 0; margin-bottom: 14px">
          <div class="kicker">{{ primaryTag }} · {{ entry.style }}</div>
          <div class="title-row">
            <h1 class="article-title">{{ entry.title }}</h1>
            <button
              class="fav-btn"
              :class="{ on: isFav }"
              type="button"
              @click="toggleFav"
            >
              <span class="star">{{ isFav ? '★' : '☆' }}</span>
              <span>{{ isFav ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
          <div class="article-meta">
            <span>{{ entry.publishedAt || entry.createdAt }} 收录</span>
            <span>浏览 {{ entry.viewCount ?? 0 }}</span>
            <span>复制 {{ entry.copyCount ?? 0 }}</span>
            <span class="badge ok">已发布</span>
          </div>
          <div class="tags">
            <span v-for="tag in entry.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- 主体：左（演示/效果图） 右（提示词/信息/相关） -->
        <div class="layout">
          <div>
            <div v-if="entry.htmlSource">
              <div class="demo-bar">
                <i></i><i></i><i></i>
                <span style="margin-left: 6px">HTML PREVIEW · 实时渲染</span>
              </div>
              <HtmlPreview :source="entry.htmlSource" height="480px" />
            </div>

            <div v-if="entry.images.length" class="panel img-panel">
              <div class="panel-title">
                效果图
                <span class="no">{{ entry.htmlSource ? '可选 · 与 HTML 组合展示' : '静态展示' }}</span>
              </div>
              <div class="panel-body">
                <img class="main-img" :src="activeImage" :alt="entry.title" />
                <div v-if="entry.images.length > 1" class="thumbs">
                  <img
                    v-for="(image, index) in entry.images"
                    :key="image.id"
                    :src="image.url"
                    :class="{ on: index === activeImageIndex }"
                    @click="activeImageIndex = index"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside>
            <PromptBlock
              :prompt="entry.prompt"
              :entry-id="entry.id"
              :label="`PROMPT · ${entry.prompt.length} 字`"
            >
              <template #footer>
                <span>单份提示词 · v1.0</span>
                <span>{{ entry.publishedAt || entry.createdAt }} 定稿</span>
              </template>
            </PromptBlock>

            <div class="panel aside-panel">
              <div class="panel-title">案例信息</div>
              <div class="panel-body">
                <div class="info-row"><span class="k">所属标签</span><span class="v">{{ entry.tags.join(' / ') || '未标注' }}</span></div>
                <div class="info-row"><span class="k">具体样式</span><span class="v">{{ entry.style }}</span></div>
                <div class="info-row">
                  <span class="k">HTML 源码</span>
                  <span class="v">{{ entry.htmlSource ? `已附带（${Math.round((entry.htmlSource.length / 1024) * 10) / 10} KB）· 主展示` : '未附带' }}</span>
                </div>
                <div class="info-row"><span class="k">效果图</span><span class="v">{{ entry.images.length ? `${entry.images.length} 张` : '无' }}</span></div>
              </div>
            </div>

            <div v-if="related.length" class="panel aside-panel">
              <div class="panel-title">
                同类提示词
                <span class="no">共享「{{ primaryTag }}」标签</span>
              </div>
              <div class="panel-body">
                <div class="rel">
                  <RouterLink
                    v-for="item in related"
                    :key="item.id"
                    class="rel-item"
                    :to="`/prompts/${item.id}`"
                  >
                    <Thumb :src="item.images[0]?.url ?? ''" :text="item.title" class="rel-thumb" />
                    <div>
                      <div class="t">{{ item.title }}</div>
                      <div class="c">{{ item.tags.slice(0, 2).join(' / ') || item.style }} · {{ item.style }}</div>
                    </div>
                  </RouterLink>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </div>

    <!-- 轻量 Toast（收藏反馈） -->
    <Teleport to="body">
      <div class="v-toast" :class="{ show: toastShow }">{{ toast }}</div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/common/EmptyState.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import HtmlPreview from '@/components/business/HtmlPreview.vue'
import PromptBlock from '@/components/business/PromptBlock.vue'
import Thumb from '@/components/common/Thumb.vue'
import { getEntry, listRelated } from '@/api/entry'
import { useFavorites } from '@/composables/useFavorites'

import type { Entry } from '@/types'

const route = useRoute()
const router = useRouter()

/* ---------- 数据状态 ---------- */
const entry = ref<Entry | null>(null)
const related = ref<Entry[]>([])
const loading = ref(true)
const notFound = ref(false)
const activeImageIndex = ref(0)

/* ---------- 收藏 ---------- */
const { has: hasFav, toggle: toggleFavItem } = useFavorites()

const entryId = computed(() => Number(route.params.id))
/** 主标签：标签即分类后的分组名（历史数据回退大类名） */
const primaryTag = computed(() =>
  entry.value?.tags[0] || entry.value?.categoryName || '提示词',
)
/** 收藏状态（type=提示词，与收藏页共用存储） */
const isFav = computed(() => entry.value !== null && hasFav('prompt', String(entry.value.id)))
const activeImage = computed(
  () => entry.value?.images[activeImageIndex.value]?.url ?? entry.value?.images[0]?.url ?? '',
)

/** 轻量 Toast */
const toast = ref('')
const toastShow = ref(false)
let toastTimer: number | undefined
function showToast(text: string): void {
  toast.value = text
  toastShow.value = true
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toastShow.value = false), 1400)
}

/** 加载详情与相关案例 */
async function load(): Promise<void> {
  loading.value = true
  notFound.value = false
  activeImageIndex.value = 0
  try {
    entry.value = await getEntry(entryId.value)
    related.value = await listRelated(entryId.value)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

/** 切换收藏（新签名：整条 FavItem） */
function toggleFav(): void {
  if (!entry.value) return
  const e = entry.value
  const added = toggleFavItem({
    type: 'prompt',
    id: String(e.id),
    title: e.title,
    cat: `${primaryTag.value} · ${e.style}`,
    desc: e.summary,
    cover: e.images[0]?.url,
  })
  showToast(added ? '已收藏，可在收藏页查看' : '已取消收藏')
}

/** 复制提示词全文并计数（由 PromptBlock 组件内部承担） */

watch(() => route.params.id, load)
load()
</script>

<style scoped>
.narrow {
  width: min(1160px, calc(100% - 48px));
}
/* 标题行：标题占满，收藏按钮右侧同行 */
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.title-row .article-title {
  flex: 1;
  min-width: 0;
}
.title-row .fav-btn {
  flex: 0 0 auto;
  margin-top: 12px;
}
/* 主体两列：左内容 右信息 */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
}
@media (max-width: 1020px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
/* 面板（纸感由 tokens 提供） */
.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.img-panel {
  margin-top: 16px;
}
.aside-panel {
  margin-top: 18px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  font-weight: 650;
  font-family: var(--serif);
}
.panel-title .no {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-3);
  font-weight: 400;
}
.panel-body {
  padding: 18px;
}
.main-img {
  width: 100%;
  display: block;
  border-radius: 10px;
  border: 1px solid var(--line);
}
.thumbs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.thumbs img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: 0.15s;
  opacity: 0.75;
}
.thumbs img:hover {
  opacity: 1;
}
.thumbs img.on {
  border-color: var(--red);
  opacity: 1;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 13px;
}
.info-row:last-of-type {
  border-bottom: none;
}
.info-row .k {
  color: var(--ink-2);
}
.info-row .v {
  font-weight: 500;
}
/* 相关案例 */
.rel {
  display: grid;
  gap: 10px;
}
.rel-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  background: var(--card);
  text-decoration: none;
  color: var(--ink);
}
.rel-item:hover {
  border-color: color-mix(in srgb, var(--red) 40%, var(--line));
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(58, 43, 28, 0.12);
}
.rel-item .rel-thumb {
  width: 72px;
  height: 54px;
  border-radius: 6px;
  border: 1px solid var(--line);
  flex-shrink: 0;
}
.rel-item .t {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  font-family: var(--serif);
}
.rel-item .c {
  font-size: 11px;
  color: var(--red);
  margin-top: 3px;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}
</style>
