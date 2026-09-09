import http from './request'
import { USE_MOCK } from '@/config'
import {
  mockCreateCategory,
  mockListCategories,
  mockRemoveCategory,
  mockSortCategories,
  mockUpdateCategory,
} from '@/mock'

import type { Category } from '@/types'

export function listCategories(): Promise<Category[]> {
  if (USE_MOCK) return mockListCategories()
  return http.get<Category[]>('/categories')
}

export function createCategory(data: { name: string }): Promise<Category> {
  if (USE_MOCK) return mockCreateCategory(data.name)
  return http.post<Category>('/categories', data)
}

export function updateCategory(id: number, data: { name: string }): Promise<void> {
  if (USE_MOCK) return mockUpdateCategory(id, data.name)
  return http.put(`/categories/${id}`, data)
}

export function sortCategories(ids: number[]): Promise<void> {
  if (USE_MOCK) return mockSortCategories(ids)
  return http.put('/categories/sort', { ids })
}

export function removeCategory(id: number): Promise<void> {
  if (USE_MOCK) return mockRemoveCategory(id)
  return http.delete(`/categories/${id}`)
}
