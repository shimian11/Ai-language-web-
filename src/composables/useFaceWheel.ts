/**
 * 首页滚轮接管：页面无滚动条时，滚轮（横/竖）统一作为「切换卡片」意图。
 * - 桌面端（>820px）生效；移动端原生滚动不受影响
 * - 三档阈值：累计 100 切 1 张、700 切 2 张、1200 切 3 张
 * - 方向变化或停顿 180ms 后清零，避免惯性残留
 * - 卸载时自动解绑
 */
import { onBeforeUnmount } from 'vue'

/** 累计滚动量达到这些阈值时，分别切 1 / 2 / 3 张（最后一档也是单次上限） */
const STEP_THRESHOLDS = [100, 700, 1200]
/** 停止滚动多久后清空累计量 */
const IDLE_RESET_MS = 180

export function useFaceWheel(onNext: () => void, onPrev: () => void) {
  let acc = 0
  let resetTimer: number | undefined
  let bound = false
  let boundTarget: Window | HTMLElement | null = null

  const handler = (e: Event): void => {
    const we = e as WheelEvent
    if (window.innerWidth <= 820) return

    // 统一不同浏览器的滚动单位：行 / 页 → 近似像素
    let delta = Math.abs(we.deltaX) > Math.abs(we.deltaY) ? we.deltaX : we.deltaY
    if (we.deltaMode === 1) delta *= 16
    else if (we.deltaMode === 2) delta *= 100
    if (Math.abs(delta) < 1) return

    we.preventDefault()

    // 反向滚动时先清掉旧方向的累计
    if (Math.sign(delta) !== Math.sign(acc)) acc = 0
    acc += delta

    window.clearTimeout(resetTimer)
    resetTimer = window.setTimeout(() => {
      acc = 0
    }, IDLE_RESET_MS)

    const abs = Math.abs(acc)
    // 命中哪一档阈值就切几张：100 → 1 张，700 → 2 张，1200 → 3 张
    let steps = 0
    for (let i = 0; i < STEP_THRESHOLDS.length; i++) {
      if (abs >= STEP_THRESHOLDS[i]) steps = i + 1
    }
    if (steps <= 0) return

    const dir = delta > 0 ? 1 : -1
    for (let i = 0; i < steps; i++) {
      if (dir > 0) onNext()
      else onPrev()
    }
    acc -= dir * STEP_THRESHOLDS[steps - 1]
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
    window.clearTimeout(resetTimer)
    boundTarget = null
    bound = false
  }

  onBeforeUnmount(unbindWheel)
  return { bindWheel, unbindWheel }
}
