import type { ArticleTopic, ArticleType } from '@/types'

/**
 * 文章类型配置（后台管理页与编辑器共用）
 * 前端只维护「显示名 / 栏目 / 路由」这类展示信息，内容本身全部来自后端。
 */

/** 各类型的栏目（实习无栏目，按公司组织） */
export const ARTICLE_TOPICS: Record<ArticleType, Array<{ key: ArticleTopic; label: string }>> = {
  note: [
    { key: 'proj', label: '项目实战' },
    { key: 'ai', label: 'AI 使用' },
    { key: 'learn', label: '学习方法' },
  ],
  internship: [],
  interview: [
    { key: 'exp', label: '面经分享' },
    { key: 'bigu', label: '八股考题' },
    { key: 'algo', label: '算法题' },
  ],
}

/** 类型元信息 */
export interface ArticleTypeMeta {
  /** 类型中文名 */
  label: string
  /** 前台列表路由 */
  listPath: string
  /** 后台管理路由 */
  adminPath: string
  /** 编辑器标题 */
  editorTitle: string
  /** 编辑器英文副标题 */
  kicker: string
  /** 编辑器「本文将展示在」说明 */
  destination: string
}

export const ARTICLE_TYPE_META: Record<ArticleType, ArticleTypeMeta> = {
  note: {
    label: '心得',
    listPath: '/notes',
    adminPath: '/admin/notes',
    editorTitle: '写心得',
    kicker: 'NOTE EDITOR',
    destination: '前台「心得」页对应栏目 → 文章详情（含收藏与上一篇/下一篇）。',
  },
  internship: {
    label: '实习记录',
    listPath: '/internship',
    adminPath: '/admin/internship',
    editorTitle: '写实习记录',
    kicker: 'INTERNSHIP EDITOR',
    destination: '前台「实习」页：挂到所选公司的竖向时间线上。',
  },
  interview: {
    label: '面试内容',
    listPath: '/interview',
    adminPath: '/admin/interview',
    editorTitle: '写面试内容',
    kicker: 'INTERVIEW EDITOR',
    destination: '前台「面试」页对应栏目 → 文章详情（含收藏与上一篇/下一篇）。',
  },
}

/** 面经结果选项（resultClass 决定徽标颜色） */
export const INTERVIEW_RESULTS: Array<{ label: string; className: 'ok' | 'warn' | 'fail' }> = [
  { label: '通过', className: 'ok' },
  { label: '未通过', className: 'fail' },
  { label: '待定', className: 'warn' },
]

/** 由栏目 key 取显示名（找不到时回退 key 本身） */
export function topicLabel(type: ArticleType, key: string): string {
  return ARTICLE_TOPICS[type].find((t) => t.key === key)?.label ?? key
}
