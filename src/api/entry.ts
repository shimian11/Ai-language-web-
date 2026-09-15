import http from './request'
import { USE_MOCK } from '@/config'
import {
  mockCreateEntry,
  mockEntryGroups,
  mockGetEntry,
  mockOverview,
  mockPageEntries,
  mockRelated,
  mockRemoveEntry,
  mockUpdateEntry,
  mockUpdateEntryStatus,
} from '@/mock'

import type { Entry, EntryGroup, EntryStatus, PageResult, Platform } from '@/types'

export interface EntryPageParams {
  page: number
  size: number
  categoryId?: number
  platform?: Platform
  title?: string
  style?: string
  keyword?: string
  status?: EntryStatus
}

export interface AdminOverview {
  published: number
  drafts: number
  categories: number
  totalViews: number
  recent: Entry[]
}

export function pageEntries(params: EntryPageParams): Promise<PageResult<Entry>> {
  if (USE_MOCK) return mockPageEntries(params)
  return http.get<PageResult<Entry>>('/entries', params)
}

export function entryGroups(
  params: Pick<EntryPageParams, 'status' | 'keyword' | 'platform'>,
): Promise<EntryGroup[]> {
  if (USE_MOCK) return mockEntryGroups(params)
  return http.get<EntryGroup[]>('/entries/groups', params)
}

export function getEntry(id: number): Promise<Entry> {
  if (USE_MOCK) return mockGetEntry(id)
  return http.get<Entry>(`/entries/${id}`)
}

export function createEntry(data: Partial<Entry>): Promise<Entry> {
  if (USE_MOCK) return mockCreateEntry(data)
  return http.post<Entry>('/entries', data)
}

export function updateEntry(id: number, data: Partial<Entry>): Promise<void> {
  if (USE_MOCK) return mockUpdateEntry(id, data)
  return http.put(`/entries/${id}`, data)
}

export function updateEntryStatus(id: number, status: EntryStatus): Promise<void> {
  if (USE_MOCK) return mockUpdateEntryStatus(id, status)
  return http.put(`/entries/${id}/status`, { status })
}

export function incrementCopy(id: number): Promise<void> {
  if (USE_MOCK) return Promise.resolve()
  return http.post(`/entries/${id}/copy`)
}

export function removeEntry(id: number): Promise<void> {
  if (USE_MOCK) return mockRemoveEntry(id)
  return http.delete(`/entries/${id}`)
}

export function listRelated(id: number): Promise<Entry[]> {
  if (USE_MOCK) return mockRelated(id)
  return http.get<Entry[]>(`/entries/${id}/related`)
}

export function getOverview(): Promise<AdminOverview> {
  if (USE_MOCK) return mockOverview()
  return http.get<AdminOverview>('/admin/overview')
}
