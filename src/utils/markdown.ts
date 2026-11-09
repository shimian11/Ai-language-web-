import { marked } from 'marked'

/**
 * Markdown 渲染（文章正文唯一入口）
 * - 正文由管理员在后台录入，属可信内容，直接 v-html 渲染
 * - 种子数据里的内联 HTML 本身也是合法 Markdown，marked 会原样透传
 */
marked.setOptions({
  gfm: true,
  breaks: false,
})

export function renderMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return ''
  return marked.parse(markdown) as string
}

/** 生成正文纯文本摘要（列表/预览用，最多 80 字） */
export function markdownToText(markdown: string | null | undefined, limit = 80): string {
  if (!markdown) return ''
  const text = markdown
    .replace(/<[^>]+>/g, '')
    .replace(/[#>*`_~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > limit ? `${text.slice(0, limit)}…` : text
}
