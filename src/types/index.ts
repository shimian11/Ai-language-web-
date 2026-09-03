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

export type EntryStatus = 'DRAFT' | 'PUBLISHED'

export interface EntryImage {
  id: number
  url: string
  isMain: boolean
}

export interface Entry {
  id: number
  title: string
  summary: string
  categoryId: number
  categoryName?: string
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
