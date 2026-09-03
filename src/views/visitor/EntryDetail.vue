<template>
  <div class="wrap">
    <PageSkeleton v-if="loading" :count="1" />

    <EmptyState
      v-else-if="notFound || !entry"
      title="案例不存在"
      description="它可能还未发布或已被删除"
    >
      <el-button round @click="router.push({ name: 'home' })">返回首页</el-button>
    </EmptyState>

    <template v-else>
      <div class="crumb">
        <RouterLink to="/">首页</RouterLink>
        <span>/</span>
        <RouterLink :to="{ name: 'home', query: { category: String(entry.categoryId) } }">
          {{ entry.categoryName }}
        </RouterLink>
        <span>/</span>
        <b>{{ entry.style }}</b>
      </div>

      <div class="head">
        <div>
          <h1>{{ entry.title }}</h1>
          <div class="head-meta">
            <span class="meta-pill">{{ entry.publishedAt || entry.createdAt }} 收录</span>
            <span class="meta-pill">👁 {{ entry.viewCount ?? 0 }} 次浏览</span>
            <span class="meta-pill">⧉ {{ entry.copyCount ?? 0 }} 次复制</span>
            <span class="meta-pill live">● 已发布</span>
          </div>
        </div>
        <div class="head-actions">
          <button class="btn" :class="{ faved: isFav }" type="button" @click="toggleFav">
            {{ isFav ? '★ 已收藏' : '★ 收藏' }}
          </button>
          <button class="btn primary" type="button" @click="copyTop">{{ copyDone ? '✓ 已复制' : '⧉ 复制提示词' }}</button>
        </div>
      </div>

      <div class="layout">
        <div>
          <div v-if="entry.htmlSource" class="panel">
            <div class="panel-title">HTML 实时演示</div>
            <div class="panel-body">
              <div class="preview-bar">
                <span>案例附带的 HTML 源码（沙箱隔离渲染）</span>
                <span class="tagmono">sandbox: allow-same-origin</span>
              </div>
              <HtmlPreview :source="entry.htmlSource" height="480px" />
            </div>
          </div>

          <div v-if="entry.images.length" class="panel" :class="{ 'mt': entry.htmlSource }">
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
          <PromptBlock :prompt="entry.prompt" :label="`PROMPT · ${entry.prompt.length} 字`">
            <template #footer>
              <span>单份提示词 · v1.0</span>
              <span>{{ entry.publishedAt || entry.createdAt }} 定稿</span>
            </template>
          </PromptBlock>

          <div class="panel mt">
            <div class="panel-title">案例信息</div>
            <div class="panel-body">
              <div class="info-row"><span class="k">所属大类</span><span class="v">{{ entry.categoryName }}</span></div>
              <div class="info-row"><span class="k">具体样式</span><span class="v">{{ entry.style }}</span></div>
              <div class="info-row">
                <span class="k">HTML 源码</span>
                <span class="v">{{ entry.htmlSource ? `已附带（${Math.round(entry.htmlSource.length / 1024 * 10) / 10} KB）· 主展示` : '未附带' }}</span>
              </div>
              <div class="info-row"><span class="k">效果图</span><span class="v">{{ entry.images.length ? `${entry.images.length} 张` : '无' }}</span></div>
              <div v-if="entry.tags.length" class="tags">
                <span v-for="tag in entry.tags" :key="tag" class="tag">#{{ tag }}</span>
              </div>
            </div>
          </div>

          <div v-if="related.length" class="panel mt">
            <div class="panel-title">相关案例 <span class="no">同属「{{ entry.categoryName }}」</span></div>
            <div class="panel-body">
              <div class="rel">
                <div
                  v-for="item in related"
                  :key="item.id"
                  class="rel-item"
                  @click="router.push({ name: 'entry-detail', params: { id: String(item.id) } })"
                >
                  <img :src="item.images[0]?.url ?? ''" alt="" />
                  <div>
                    <div class="t">{{ item.title }}</div>
                    <div class="c">{{ item.categoryName }} · {{ item.style }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/common/EmptyState.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import HtmlPreview from '@/components/business/HtmlPreview.vue'
import PromptBlock from '@/components/business/PromptBlock.vue'
import { getEntry, listRelated } from '@/api/entry'
import { useCopy } from '@/composables/useCopy'
import { useFavorites } from '@/composables/useFavorites'

import type { Entry } from '@/types'

const route = useRoute()
const router = useRouter()

const entry = ref<Entry | null>(null)
const related = ref<Entry[]>([])
const loading = ref(true)
const notFound = ref(false)
const activeImageIndex = ref(0)

const { copy } = useCopy()
const copyDone = ref(false)
const { has: hasFav, toggle: toggleFavStore } = useFavorites()

const entryId = computed(() => Number(route.params.id))
const isFav = computed(() => entry.value !== null && hasFav(String(entry.value.id)))
const activeImage = computed(
  () => entry.value?.images[activeImageIndex.value]?.url ?? entry.value?.images[0]?.url ?? '',
)

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

function toggleFav(): void {
  if (entry.value) toggleFavStore(String(entry.value.id))
}

async function copyTop(): Promise<void> {
  if (!entry.value) return
  await copy(entry.value.prompt)
  copyDone.value = true
  setTimeout(() => {
    copyDone.value = false
  }, 1600)
}

watch(() => route.params.id, load)
load()
</script>

<style scoped>
.wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 32px 80px;
}

.crumb {
  font-size: 13px;
  color: var(--ink-2);
  display: flex;
  gap: 8px;
  align-items: center;
}

.crumb a:hover {
  color: var(--accent-ink);
}

.crumb b {
  color: var(--ink);
  font-weight: 600;
}

.head {
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

h1 {
  font-size: 28px;
  line-height: 1.35;
  font-weight: 700;
  max-width: 760px;
}

.head-meta {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--ink-2);
  flex-wrap: wrap;
  align-items: center;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card);
  font-size: 12px;
  color: var(--ink-2);
}

.meta-pill.live {
  border-color: var(--ok);
  color: var(--ok);
}

.head-actions {
  display: flex;
  gap: 10px;
}

.btn {
  height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  font-weight: 500;
  transition: 0.15s;
}

.btn:hover {
  background: var(--ink);
  color: var(--bg);
}

.btn.primary {
  background: var(--ink);
  color: var(--bg);
}

.btn.primary:hover {
  background: var(--accent);
  border-color: var(--accent);
}

.btn.faved {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn.faved:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  filter: brightness(1.08);
}

.layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  margin-top: 26px;
}

@media (max-width: 1020px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

.panel.mt {
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
}

.panel-title .no {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-2);
  font-weight: 400;
}

.panel-body {
  padding: 18px;
}

.preview-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12.5px;
  color: var(--ink-2);
}

.tagmono {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 2px 8px;
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
  border-color: var(--accent);
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

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.tag {
  font-size: 12px;
  color: var(--ink-2);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px 11px;
}

.tag:hover {
  border-color: var(--accent);
  color: var(--accent-ink);
}

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
  transition: 0.15s;
  background: var(--card);
}

.rel-item:hover {
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(26, 24, 21, 0.07);
}

.rel-item img {
  width: 72px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 6px;
}

.rel-item .t {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
}

.rel-item .c {
  font-size: 11.5px;
  color: var(--accent-ink);
  margin-top: 3px;
}
</style>
