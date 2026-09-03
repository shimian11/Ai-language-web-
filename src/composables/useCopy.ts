import { ElMessage } from 'element-plus'

export function useCopy() {
  async function copy(text: string): Promise<void> {
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
  }

  return { copy }
}
