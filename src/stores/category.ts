import { ref } from 'vue'
import { defineStore } from 'pinia'

import { createCategory, listCategories } from '@/api/category'

import type { Category } from '@/types'

// 首页胶囊墙默认展示的大类数量，其余进入「更多分类」面板
const VISIBLE_PILL_COUNT = 7

export const useCategoryStore = defineStore('category', () => {
  const list = ref<Category[]>([])
  const loading = ref(false)

  const visiblePills = ref<Category[]>([])
  const moreList = ref<Category[]>([])

  function splitVisible(): void {
    visiblePills.value = list.value.slice(0, VISIBLE_PILL_COUNT)
    moreList.value = list.value.slice(VISIBLE_PILL_COUNT)
  }

  async function fetchCategories(): Promise<void> {
    loading.value = true
    try {
      list.value = await listCategories()
      splitVisible()
    } finally {
      loading.value = false
    }
  }

  async function addCategory(name: string): Promise<Category> {
    const created = await createCategory({ name })
    list.value.push(created)
    splitVisible()
    return created
  }

  return { list, loading, visiblePills, moreList, fetchCategories, addCategory }
})
