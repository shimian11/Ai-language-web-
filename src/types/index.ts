export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface Category {
  id: number
  name: string
  sort: number
  entryCount?: number
}

export type Platform = 'web' | 'app' | 'general'

export type EntryStatus = 'DRAFT' | 'PUBLISHED'

export interface EntryImage {
  id: number
  url: string
  isMain: boolean
}

/** 后台分组视图：按 (设计大类, 案例标题) 聚合的一组 */
export interface EntryGroup {
  categoryId: number
  categoryName: string
  title: string
  count: number
  cover?: string
}

export interface Entry {
  id: number
  title: string
  summary: string
  categoryId: number
  categoryName?: string
  platform?: Platform
  style: string
  prompt: string
  htmlSource?: string
  images: EntryImage[]
  tags: string[]
  status: EntryStatus
  publishedAt?: string
  createdAt: string
  viewCount?: number
  copyCount?: number
}

/* ============================================================
   博客文章（心得 / 实习 / 面试）
   2026-11 改版新增；P1 使用 src/mocks/articles.ts 的本地数据，
   P3 后端 article 表就绪后切换为真实接口，字段保持一致。
   ============================================================ */

/** 内容类型：心得 / 实习记录 / 面试内容（提示词是独立的 entry，不在此列） */
export type ArticleType = 'note' | 'internship' | 'interview'

/** 文章栏目：心得按主题分栏，面试按内容形态分栏；实习无栏目（按公司组织） */
export type ArticleTopic = 'proj' | 'ai' | 'learn' | 'exp' | 'bigu' | 'algo' | ''

/** 文章实体（与后端 article 表字段一一对应） */
export interface Article {
  id: number
  type: ArticleType
  /** 栏目 key，实习记录为空串 */
  topic: ArticleTopic
  /** 栏目显示名（如「项目实战」「面经分享」），实习记录显示公司别名 */
  sub: string
  title: string
  /** 摘要，显示在列表 */
  summary: string
  /** 正文 HTML（P1 由 mock 提供；P3 后端存 Markdown，前端渲染） */
  body: string
  tags: string[]
  /** 实习记录：所属公司别名（脱敏） */
  company?: string
  /** 实习记录：时间点（如 2026-08）；其他类型为发布日期 */
  date: string
  /** 面试面经分享的结果标注（通过/未通过/待定），其余为空 */
  result?: string
  resultClass?: 'ok' | 'warn' | 'fail'
  status: EntryStatus
  /** 阅读时长标注（如「6 分钟」） */
  read: string
}

/** 公司别名（实习两级时间线第一级；P3 落 company 表） */
export interface Company {
  key: string
  name: string
  /** 角色标注，如「全栈 · 2026.03 — 05」 */
  meta: string
  /** 里程碑公司（如「阶段总结」）用金色节点 */
  milestone?: boolean
}

/** 收藏条目：本地 localStorage 存储，四类内容通用 */
export type FavType = 'prompt' | ArticleType

export interface FavItem {
  type: FavType
  id: string
  title: string
  /** 归属标注（如「首屏 · 左对齐」「AI 使用」「某创业公司」） */
  cat: string
  desc: string
}
