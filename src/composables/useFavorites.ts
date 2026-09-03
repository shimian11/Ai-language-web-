import { ref } from 'vue'

const FAV_KEY = 'ai_lang_favs'

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') as string[]
  } catch {
    return []
  }
}

// 模块级状态：详情页与收藏页共享同一份响应式收藏列表
const favIds = ref<string[]>(read())

function persist(): void {
  localStorage.setItem(FAV_KEY, JSON.stringify(favIds.value))
}

export function useFavorites() {
  function has(id: string): boolean {
    return favIds.value.includes(id)
  }

  function toggle(id: string): void {
    favIds.value = has(id) ? favIds.value.filter((x) => x !== id) : [...favIds.value, id]
    persist()
  }

  function remove(id: string): void {
    favIds.value = favIds.value.filter((x) => x !== id)
    persist()
  }

  return { favIds, has, toggle, remove }
}
