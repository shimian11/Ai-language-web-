<template>
  <div ref="targetRef" class="html-preview" :style="{ height }">
    <iframe
      v-if="shouldRender"
      :srcdoc="source"
      sandbox="allow-same-origin"
      :title="title"
      loading="lazy"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useLazyIframe } from '@/composables/useLazyIframe'

const props = withDefaults(
  defineProps<{
    source: string
    height?: string
    lazy?: boolean
    title?: string
  }>(),
  { height: '480px', lazy: true, title: 'HTML 实时预览' },
)

const { targetRef, visible } = useLazyIframe<HTMLDivElement>()

const shouldRender = computed(() => !props.lazy || visible.value)
</script>

<style scoped>
.html-preview {
  position: relative;
  background: #0b1220;
  border-radius: 10px;
  overflow: hidden;
}

.html-preview iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
