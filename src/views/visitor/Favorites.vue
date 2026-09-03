<template>
  <div class="wrap">
    <div class="head">
      <h1>我的<span>收藏</span></h1>
      <p>收藏保存在当前浏览器中，无需登录，换设备或清除浏览器数据后失效。</p>
      <div class="cnt">共 {{ list.length }} 条</div>
    </div>

    <PageSkeleton v-if="loading" :count="4" />

    <EmptyState
      v-else-if="!list.length"
      title="还没有收藏任何案例"
      description="浏览案例时点击「★ 收藏」，它们会出现在这里"
    >
      <el-button round @click="router.push({ name: 'home' })">去逛逛首页 →</el-button>
    </EmptyState>

    <div v-else class="masonry">
      <EntryCard v-for="entry in list" :key="entry.id" :entry="entry" @open="openEntry(entry.id)">
        <template #foot>
          <button class="unfav" type="button" @click.stop="onRemove(entry.id)">取消收藏</button>
        </template>
      </EntryCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

import EmptyState from '@/components/common/EmptyState.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import EntryCard from '@/components/business/EntryCard.vue'
import { getEntry } from '@/api/entry'
import { useFavorites } from '@/composables/useFavorites'

import type { Entry } from '@/types'

const router = useRouter()
const { favIds, remove } = useFavorites()

const list = ref<Entry[]>([])
const loading = ref(true)

async function load(): Promise<void> {
  loading.value = true
  try {
    const results = await Promise.all(
      favIds.value.map((id) => getEntry(Number(id)).catch(() => null)),
    )
    list.value = results.filter((entry): entry is Entry => entry !== null)
  } finally {
    loading.value = false
  }
}

async function onRemove(id: number): Promise<void> {
  try {
    await ElMessageBox.confirm('确定取消收藏该案例吗？', '取消收藏', {
      confirmButtonText: '取消收藏',
      cancelButtonText: '再想想',
      type: 'warning',
    })
  } catch {
    return
  }
  remove(String(id))
}

function openEntry(id: number): void {
  router.push({ name: 'entry-detail', params: { id: String(id) } })
}

watch(favIds, load)
load()
</script>

<style scoped>
.wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 32px 80px;
}

.head h1 {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.head h1 span {
  color: var(--accent);
}

.head p {
  margin-top: 10px;
  color: var(--ink-2);
  font-size: 14px;
}

.cnt {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-2);
}

.masonry {
  margin-top: 20px;
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

.unfav {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  font-size: 12px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.15s;
}

.unfav:hover {
  color: var(--accent);
  border-color: var(--accent);
}
</style>
