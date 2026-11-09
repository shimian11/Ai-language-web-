import http from './request'

import type { Article, ArticleType, Company, EntryStatus, PageResult } from '@/types'

/**
 * 博客文章接口（心得 / 实习 / 面试）
 * 对应后端 ArticleController（/api/articles），契约见《后端开发文档》§6.2。
 * 隐私规则由后端处理：不带 token 只会返回已发布文章。
 */

/** 列表查询参数 */
export interface ArticlePageParams {
  page?: number
  size?: number
  /** 内容类型 */
  type?: ArticleType
  /** 栏目 key（proj/ai/learn/exp/bigu/algo） */
  topic?: string
  status?: EntryStatus
  /** 关键词（匹配标题/摘要/标签） */
  keyword?: string
  /** 公司 key（仅实习记录） */
  companyKey?: string
  /** 按展示日期排序方向 */
  sort?: 'asc' | 'desc'
}

/** 新建 / 更新入参（覆盖式） */
export interface ArticleSavePayload {
  type: ArticleType
  /** 栏目 key；实习传空串 */
  topic?: string
  /** 栏目显示名；实习传公司别名 */
  sub?: string
  title: string
  summary?: string
  /** 正文 Markdown */
  body?: string
  /** 封面图 URL（MinIO objectUrl，可空） */
  cover?: string
  tags?: string[]
  /** 实习记录所属公司 key */
  companyKey?: string
  /** 展示日期：实习为 2026-08，其余为 2026-10-18 */
  displayDate?: string
  result?: string
  resultClass?: string
  /** 阅读时长标注，如「6 分钟」 */
  readLabel?: string
  status?: EntryStatus
}

/** 公司别名（含已发布 / 全部计数，后台与前台时间线共用） */
export interface CompanyItem extends Company {
  countPublished?: number
  countAll?: number
}

/** 公司新建入参 */
export interface CompanyCreatePayload {
  name: string
  meta?: string
  milestone?: boolean
}

/** 分页列表 */
export function pageArticles(params: ArticlePageParams): Promise<PageResult<Article>> {
  return http.get<PageResult<Article>>('/articles', params)
}

/**
 * 取某类型的全部已发布文章（个人站量级，一次取回供列表页做栏目计数与排序）。
 * 超过 200 篇时需要改为服务端分页。
 */
export async function listPublishedArticles(type: ArticleType): Promise<Article[]> {
  const data = await pageArticles({ type, status: 'PUBLISHED', size: 200 })
  return data.list
}

/** 文章详情（匿名访问草稿会由后端返回业务错误） */
export function getArticleDetail(id: number | string): Promise<Article> {
  return http.get<Article>(`/articles/${id}`)
}

/** 新建文章 */
export function createArticle(data: ArticleSavePayload): Promise<Article> {
  return http.post<Article>('/articles', data)
}

/** 覆盖式更新（不改状态，状态走 updateArticleStatus） */
export function updateArticle(id: number, data: ArticleSavePayload): Promise<Article> {
  return http.put<Article>(`/articles/${id}`, data)
}

/** 发布 / 下架 */
export function updateArticleStatus(id: number, status: EntryStatus): Promise<void> {
  return http.put(`/articles/${id}/status`, { status })
}

/** 删除文章 */
export function removeArticle(id: number): Promise<void> {
  return http.delete(`/articles/${id}`)
}

/** 公司别名列表（按 sort 升序） */
export function listCompanies(): Promise<CompanyItem[]> {
  return http.get<CompanyItem[]>('/articles/companies')
}

/** 新建公司别名（key 由后端按名称生成） */
export function createCompany(data: CompanyCreatePayload): Promise<CompanyItem> {
  return http.post<CompanyItem>('/articles/companies', data)
}
