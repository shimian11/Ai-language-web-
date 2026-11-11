<template>
  <div ref="targetRef" class="html-preview" :class="{ framed }" :style="{ height }">
    <iframe
      v-if="shouldRender"
      :srcdoc="source"
      sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
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
    /** 详情页窗口模式：与上方 .demo-bar 拼成完整浏览器窗口（上直角、左/右/下边框连续） */
    framed?: boolean
  }>(),
  { height: '480px', lazy: true, title: 'HTML 实时预览', framed: false },
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

/* 详情页：上边框交给 .demo-bar，这里只补左/右/下边框并把上两角改直角，
   否则圆角与标题栏之间会露出左右两个三角缺口，且左右边框对不齐 */
.html-preview.framed {
  border: 1px solid var(--line);
  border-top: 0;
  border-radius: 0 0 14px 14px;
  background: #fff;
}

.html-preview iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
