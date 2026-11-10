/**
 * 首页滚轮接管：页面无滚动条时，滚轮（横/竖）统一作为「切换卡片」意图。
 * - 桌面端（>820px）生效；移动端原生滚动不受影响
 * - 累积 delta 节流：触控板惯性小步不抖动，滚轮一格 = 切一张
 * - 卸载时自动解绑
 */
import { onBeforeUnmount } from 'vue'

export function useFaceWheel(onNext: () => void, onPrev: () => void) {
  let wheelLock = 0
  let bound = false
  let boundTarget: Window | HTMLElement | null = null

  const handler = (e: Event): void => {
    const we = e as WheelEvent
    if (window.innerWidth <= 820) return
    // 横向滚轮（部分鼠标/触控板双指横滑）同样算切换意图
    const delta = Math.abs(we.deltaX) > Math.abs(we.deltaY) ? we.deltaX : we.deltaY
    if (Math.abs(delta) < 12) return
    we.preventDefault()
    const now = Date.now()
    if (now - wheelLock < 680) return
    wheelLock = now
    if (delta > 0) onNext()
    else onPrev()
  }

  function bindWheel(target: Window | HTMLElement): void {
    if (bound) return
    boundTarget = target
    target.addEventListener('wheel', handler as EventListener, { passive: false })
    bound = true
  }

  function unbindWheel(): void {
    if (!bound || !boundTarget) return
    boundTarget.removeEventListener('wheel', handler as EventListener)
    boundTarget = null
    bound = false
  }

  onBeforeUnmount(unbindWheel)
  return { bindWheel, unbindWheel }
}
