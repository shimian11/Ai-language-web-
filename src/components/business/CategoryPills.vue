<template>
  <div ref="wrapRef" class="pills">
    <button
      class="tab"
      :class="{ on: modelValue === undefined }"
      type="button"
      @click="select(undefined)"
    >
      全部
    </button>
    <button
      v-for="category in visibleCategories"
      :key="category.id"
      class="tab"
      :class="{ on: modelValue === category.id }"
      type="button"
      @click="select(category)"
    >
      {{ category.name }}
    </button>
    <button
      v-if="extraSelected"
      class="tab on"
      type="button"
      @click="select(extraSelected)"
    >
      {{ extraSelected.name }}
    </button>

    <div class="more-wrap">
      <button class="tab" :class="{ on: panelSelected }" type="button" @click.stop="togglePanel">
        更多分类 ▾
      </button>
      <div v-if="open" class="more-panel">
        <input
          v-model="query"
          class="mp-search"
          type="text"
          placeholder="搜索分类…"
          @click.stop
        />
        <div class="mp-grid">
          <button
            class="tab"
            :class="{ on: modelValue === undefined }"
            type="button"
            @click.stop="select(undefined)"
          >
            全部
          </button>
          <button
            v-for="category in filteredCategories"
            :key="category.id"
            class="tab"
            :class="{ on: modelValue === category.id }"
            type="button"
            @click.stop="select(category)"
          >
            {{ category.name }}
          </button>
          <div v-if="!filteredCategories.length" class="mp-empty">未找到匹配的分类</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type { Category } from '@/types'

const props = withDefaults(
  defineProps<{
    categories: Category[]
    modelValue?: number
    visibleCount?: number
  }>(),
  { modelValue: undefined, visibleCount: 7 },
)

const emit = defineEmits<{ 'update:modelValue': [value: number | undefined] }>()

const wrapRef = ref<HTMLDivElement | null>(null)
const open = ref(false)
const query = ref('')

const visibleCategories = computed(() => props.categories.slice(0, props.visibleCount))

const extraSelected = computed(() => {
  if (props.modelValue === undefined) return undefined
  if (visibleCategories.value.some((category) => category.id === props.modelValue)) {
    return undefined
  }
  return props.categories.find((category) => category.id === props.modelValue)
})

const panelSelected = computed(
  () => props.modelValue !== undefined && extraSelected.value !== undefined,
)

const filteredCategories = computed(() => {
  const keyword = query.value.trim()
  if (!keyword) return props.categories
  return props.categories.filter((category) => category.name.includes(keyword))
})

function select(category?: Category): void {
  emit('update:modelValue', category?.id)
  open.value = false
}

function togglePanel(): void {
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent): void {
  if (wrapRef.value && !wrapRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<style scoped>
.pills {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tab {
  flex-shrink: 0;
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 14px;
  color: var(--ink-2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  transition: 0.15s;
  white-space: nowrap;
}

.tab:hover {
  color: var(--ink);
}

.tab.on {
  background: var(--ink);
  color: var(--bg);
  font-weight: 600;
}

.more-wrap {
  position: relative;
  flex-shrink: 0;
}

.more-panel {
  position: absolute;
  top: 44px;
  left: 0;
  z-index: 60;
  width: 440px;
  max-width: calc(100vw - 64px);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 16px 40px rgba(26, 24, 21, 0.16);
  padding: 16px;
}

.mp-search {
  width: 100%;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0 14px;
  font-size: 13px;
  outline: none;
  margin-bottom: 12px;
  color: var(--ink);
  font-family: var(--font-sans);
}

.mp-search:focus {
  border-color: var(--accent);
}

.mp-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.mp-grid .tab {
  height: 32px;
  font-size: 13px;
  padding: 0 13px;
}

.mp-empty {
  width: 100%;
  text-align: center;
  font-size: 13px;
  color: var(--ink-2);
  padding: 12px 0;
}
</style>
