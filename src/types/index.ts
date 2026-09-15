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
