import { ref } from 'vue'
import { defineStore } from 'pinia'

import { pageEntries } from '@/api/entry'

import type { Entry, EntryStatus } from '@/types'

export const useEntryStore = defineStore('entry', () => {
  const list = ref<Entry[]>([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(20)
  const categoryId = ref<number>()
  const keyword = ref('')
  const status = ref<EntryStatus>()
  const loading = ref(false)

  async function fetchEntries(): Promise<void> {
    loading.value = true
    try {
      const data = await pageEntries({
        page: page.value,
        size: size.value,
        categoryId: categoryId.value,
        keyword: keyword.value || undefined,
        status: status.value,
      })
      list.value = data.list
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  return { list, total, page, size, categoryId, keyword, status, loading, fetchEntries }
})
