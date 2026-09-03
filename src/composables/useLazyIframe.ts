import { onBeforeUnmount, onMounted, ref } from 'vue'

// 元素进入视口后 visible 置 true 并停止观察（一次性触发），用于 iframe 懒加载
export function useLazyIframe<T extends HTMLElement>() {
  const targetRef = ref<T | null>(null)
  const visible = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!targetRef.value || !('IntersectionObserver' in window)) {
      visible.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          visible.value = true
          observer?.disconnect()
          observer = null
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(targetRef.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { targetRef, visible }
}
