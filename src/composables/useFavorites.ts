import { computed, ref } from 'vue'

import type { FavItem, FavType } from '@/types'

/**
 * 收藏 composable（2026-11 改版）
 * - 存储格式升级为对象数组 FavItem（type/id/title/cat/desc），四类内容通用
 * - 兼容旧版字符串数组（视为提示词收藏，缺标题时用占位文案）
 * - 模块级响应式状态：详情页与收藏页共享同一份数据
 */
const FAV_KEY = 'ai_lang_favs'

/** 读原始存储并兼容旧格式 */
function read(): FavItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAV_KEY) || '[]') as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((x) => {
      if (typeof x === 'string') {
        // 旧格式：纯 id 字符串 → 提示词收藏
        return { type: 'prompt', id: x, title: `旧收藏 ${x}`, cat: '提示词', desc: '' } as FavItem
      }
      return x as FavItem
    })
  } catch {
    return []
  }
}

// 模块级响应式列表：跨页面共享
const favItems = ref<FavItem[]>(read())

function persist(): void {
  localStorage.setItem(FAV_KEY, JSON.stringify(favItems.value))
}

/** 各类型收藏数量（收藏页 Tab 计数用） */
const countByType = computed<Record<FavType, number>>(() => {
  const map = { prompt: 0, note: 0, internship: 0, interview: 0 } as Record<FavType, number>
  for (const item of favItems.value) map[item.type] = (map[item.type] ?? 0) + 1
  return map
})

export function useFavorites() {
  /** 是否已收藏某条（type + id 唯一定位） */
  function has(type: FavType, id: string | number): boolean {
    return favItems.value.some((x) => x.type === type && x.id === String(id))
  }

  /** 切换收藏状态，返回切换后的状态（true=已收藏） */
  function toggle(item: FavItem): boolean {
    const exists = has(item.type, item.id)
    favItems.value = exists
      ? favItems.value.filter((x) => !(x.type === item.type && x.id === item.id))
      : [...favItems.value, item]
    persist()
    return !exists
  }

  /** 移除收藏 */
  function remove(type: FavType, id: string): void {
    favItems.value = favItems.value.filter((x) => !(x.type === type && x.id === id))
    persist()
  }

  /** 清空全部 */
  function clear(): void {
    favItems.value = []
    persist()
  }

  return { favItems, countByType, has, toggle, remove, clear }
}
