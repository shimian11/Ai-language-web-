import { ElMessage } from 'element-plus'

import { incrementCopy } from '@/api/entry'

export function useCopy() {
  /**
   * 复制文本到剪贴板；传入 entryId 时在复制成功后异步累加该案例的复制计数（失败不阻断复制）。
   */
  async function copy(text: string, entryId?: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('已复制')
    if (entryId !== undefined) {
      incrementCopy(entryId).catch(() => {
        /* 计数失败不影响用户复制体验 */
      })
    }
  }

  return { copy }
}