<template>
  <div class="tier">
    <!-- 一级：大类 -->
    <div class="tier-row">
      <span class="tier-label">大类</span>
      <div class="chips">
        <button class="chip" :class="{ on: categoryId === undefined }" type="button" @click="clearCategory">
          全部
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          class="chip"
          :class="{ on: categoryId === category.id }"
          type="button"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 二级：平台 -->
    <div v-show="categoryId !== undefined" class="tier-row">
      <span class="tier-label">平台</span>
      <div class="chips">
        <button class="chip" :class="{ on: platform === undefined }" type="button" @click="clearPlatform">
          全部
        </button>
        <button
          v-for="opt in platforms"
          :key="opt.value"
          class="chip platform"
          :class="{ on: platform === opt.value }"
          type="button"
          @click="selectPlatform(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category, Platform } from '@/types'

defineProps<{
  categories: Category[]
}>()

const categoryId = defineModel<number | undefined>('categoryId', { default: undefined })
const platform = defineModel<Platform | undefined>('platform', { default: undefined })

const platforms: { label: string; value: Platform }[] = [
  { label: 'Web 网页端', value: 'web' },
  { label: 'App 应用端', value: 'app' },
  { label: '通用', value: 'general' },
]

function selectCategory(id: number): void {
  if (categoryId.value === id) return
  categoryId.value = id
  platform.value = undefined
}
function clearCategory(): void {
  categoryId.value = undefined
  platform.value = undefined
}
function selectPlatform(value: Platform): void {
  platform.value = value
}
function clearPlatform(): void {
  platform.value = undefined
}
</script>

<style scoped>
.tier {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tier-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.tier-label {
  flex-shrink: 0;
  padding-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  min-width: 40px;
}

.chips {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.chip {
  flex-shrink: 0;
  height: 32px;
  padding: 0 15px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  font-size: 13px;
  color: var(--ink-2);
  cursor: pointer;
  transition: 0.15s;
  white-space: nowrap;
}

.chip:hover {
  color: var(--ink);
  border-color: var(--accent);
}

.chip.on {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
  font-weight: 600;
}

.chip.platform {
  font-weight: 500;
}

.hint {
  color: var(--ink-2);
  font-size: 13px;
  line-height: 2.2;
}
</style>