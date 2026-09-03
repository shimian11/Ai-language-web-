<template>
  <article class="card" @click="emit('open')">
    <div class="card-img">
      <HtmlPreview
        v-if="entry.htmlSource"
        :source="entry.htmlSource"
        height="100%"
        :title="entry.title"
      />
      <img v-else-if="cover" :src="cover" :alt="entry.title" loading="lazy" />
      <span v-if="entry.htmlSource" class="badge"><i></i>HTML 实时渲染</span>
    </div>
    <div class="card-body">
      <div class="cat">{{ entry.categoryName }} · {{ entry.style }}</div>
      <div class="title">{{ entry.title }}</div>
      <div class="desc">{{ entry.summary }}</div>
      <div v-if="entry.tags.length" class="tags">
        <span v-for="tag in entry.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="foot">
        <slot name="foot">
          <button class="copy" type="button" @click.stop="onCopy">⧉ 复制提示词</button>
        </slot>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import HtmlPreview from '@/components/business/HtmlPreview.vue'
import { useCopy } from '@/composables/useCopy'

import type { Entry } from '@/types'

const props = defineProps<{ entry: Entry }>()

const emit = defineEmits<{ open: [] }>()

const { copy } = useCopy()

const cover = computed(
  () => props.entry.images.find((image) => image.isMain)?.url ?? props.entry.images[0]?.url ?? '',
)

function onCopy(): void {
  copy(props.entry.prompt)
}
</script>

<style scoped>
.card {
  break-inside: avoid;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.18s,
    box-shadow 0.18s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(26, 24, 21, 0.09);
}

.card-img {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #efece5;
  overflow: hidden;
}

.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s;
}

.card:hover .card-img img {
  transform: scale(1.03);
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  background: rgba(26, 24, 21, 0.82);
  color: #fff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(4px);
}

.badge i {
  font-style: normal;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.card-body {
  padding: 14px 16px 16px;
}

.cat {
  font-size: 12px;
  color: var(--accent-ink);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.title {
  margin-top: 5px;
  font-size: 15.5px;
  font-weight: 650;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag {
  font-size: 11.5px;
  color: var(--ink-2);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 2px 8px;
}

.foot {
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px dashed var(--line);
  display: flex;
  justify-content: flex-end;
  font-size: 12px;
  color: var(--ink-2);
}

.copy {
  border: none;
  background: transparent;
  color: var(--ink);
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
}

.copy:hover {
  color: var(--accent-ink);
}
</style>
