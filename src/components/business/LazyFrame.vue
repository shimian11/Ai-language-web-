<template>
  <div ref="root" class="lazy-frame">
    <iframe
      v-if="show"
      class="frame"
      :srcdoc="doc"
      scrolling="no"
      sandbox=""
      tabindex="-1"
      aria-hidden="true"
    ></iframe>
    <div v-else class="frame-ph" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 列表卡片里的 HTML 封面：
 * 进入视口附近才注入 srcdoc，避免首屏一次性解析全部 iframe。
 * 未注入时用微光占位，尺寸与 iframe 完全一致，不会造成版式跳动。
 */
const props = withDefaults(defineProps<{ doc: string; rootMargin?: string }>(), {
  rootMargin: '240px 0px',
})

const root = ref<HTMLElement | null>(null)
const show = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  // 老浏览器直接降级为立即渲染
  if (!('IntersectionObserver' in window)) {
    show.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        show.value = true
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: props.rootMargin },
  )

  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.lazy-frame {
  position: absolute;
  inset: 0;
  background: #fff;
}

.frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.frame-ph {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #f4eee3;
}

.frame-ph::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateX(-100%);
  animation: frame-sheen 1.4s ease-in-out infinite;
}

@keyframes frame-sheen {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .frame-ph::after {
    animation: none;
  }
}
</style>
