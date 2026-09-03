import type { Category, Entry, PageResult } from '@/types'

export type MockEntryStatus = 'DRAFT' | 'PUBLISHED'

interface MockPageParams {
  page: number
  size: number
  categoryId?: number
  keyword?: string
  status?: MockEntryStatus
}

export interface MockOverview {
  published: number
  drafts: number
  categories: number
  totalViews: number
  recent: Entry[]
}

const delay = <T>(data: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms))

export { delay }

const today = (): string => new Date().toISOString().slice(0, 10)

const HUD_HTML =
  "<!DOCTYPE html><html><head><style>body{margin:0;font-family:system-ui;background:#0B1220;color:#E6EDF3;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}.hud{width:88%;aspect-ratio:16/9;position:relative;border:1px solid #1E3A5F;border-radius:10px;background:radial-gradient(circle at 50% 45%,#10203A,#0B1220)}.kpi{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);text-align:center}.kpi b{font-size:36px;color:#5EEAD4;letter-spacing:1px;animation:pulse 2.4s ease-in-out infinite}.kpi span{display:block;font-size:11px;color:#7C8CA0;margin-top:4px}@keyframes pulse{0%,100%{text-shadow:0 0 0 rgba(94,234,212,0)}50%{text-shadow:0 0 18px rgba(94,234,212,.55)}}.ring{position:absolute;top:50%;left:50%;border:1px solid #1E3A5F;border-radius:50%;animation:rot 14s linear infinite}.r1{width:180px;height:180px;transform:translate(-50%,-50%);border-left-color:#2DD4BF}.r2{width:240px;height:240px;transform:translate(-50%,-50%);border-top-color:#38BDF8;animation-duration:20s;animation-direction:reverse}.r3{width:300px;height:300px;transform:translate(-50%,-50%);border-right-color:#818CF8;animation-duration:26s}@keyframes rot{from{rotate:0deg}to{rotate:360deg}}.sat{position:absolute;width:110px;text-align:center;font-size:10px;color:#7C8CA0}.sat b{display:block;font-size:15px;color:#E6EDF3;margin-bottom:2px}.s1{top:6%;left:50%;transform:translateX(-50%)}.s2{top:42%;left:4%}.s3{top:42%;right:4%}.s4{bottom:5%;left:26%}.s5{bottom:5%;right:26%}</style></head><body><div class='hud'><div class='kpi'><b>98.6%</b><span>今日综合达成率</span></div><div class='ring r1'></div><div class='ring r2'></div><div class='ring r3'></div><div class='sat s1'><b>1,284</b>接入设备</div><div class='sat s2'><b>17</b>待处理告警</div><div class='sat s3'><b>42ms</b>平均响应</div><div class='sat s4'><b>312</b>今日工单</div><div class='sat s5'><b>96%</b>用户满意</div></div></body></html>"

const IMG = {
  hudScreen:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20dark%20blue%20data%20visualization%20dashboard%2C%20center-focused%20radial%20layout%2C%20glowing%20charts%20and%20KPI%20numbers%2C%20futuristic%20control%20room%20style%2C%20high%20fidelity&image_size=landscape_4_3',
  radar:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20circular%20radar%20style%20data%20visualization%20center%20piece%20on%20dark%20blue%20screen%2C%20glowing%20ring%20charts%2C%20sci-fi%20hologram%20style&image_size=landscape_4_3',
  carousel:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%203D%20coverflow%20carousel%20component%20on%20a%20clean%20light%20webpage%2C%20stacked%20cards%20with%20soft%20shadows%2C%20modern%20web%20design&image_size=landscape_4_3',
  saas:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20SaaS%20landing%20page%20hero%20with%20left-right%20split%20layout%2C%20headline%20on%20left%20product%20screenshot%20on%20right%2C%20minimal%20modern%20design&image_size=landscape_4_3',
  grid:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20modular%20grid%20dashboard%20interface%2C%20neat%20card%20tiles%20with%20stats%20and%20charts%2C%20light%20theme%2C%20clean%20enterprise%20design&image_size=landscape_4_3',
  flow:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20process%20flow%20visualization%2C%20connected%20node%20chain%20diagram%20with%20icons%20and%20arrows%2C%20dark%20theme%2C%20tech%20style&image_size=landscape_4_3',
  editorial:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20minimal%20editorial%20website%20hero%2C%20bold%20typography%2C%20generous%20whitespace%2C%20elegant%20magazine%20layout&image_size=landscape_4_3',
  topDown:
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20light%20data%20screen%20with%20top%20summary%20bar%20and%20bottom%20detail%20panels%2C%20top-down%20hierarchy%2C%20blue%20accent%20color&image_size=landscape_4_3',
}

export const mockCategories: Category[] = [
  { id: 1, name: '大屏设计', sort: 1 },
  { id: 2, name: '轮播', sort: 2 },
  { id: 3, name: '落地页', sort: 3 },
  { id: 4, name: '导航菜单', sort: 4 },
  { id: 5, name: '加载动效', sort: 5 },
  { id: 6, name: '表单交互', sort: 6 },
  { id: 7, name: '数据图表', sort: 7 },
  { id: 8, name: '登录注册', sort: 8 },
  { id: 9, name: '空状态', sort: 9 },
  { id: 10, name: '时间轴', sort: 10 },
]

const rawEntries: Entry[] = [
  {
    id: 1,
    title: '指挥中心主视觉大屏：环形数据围绕核心指标',
    summary: '中央放核心 KPI 大数字，四周环绕趋势图与环形占比，一眼锁定重点。',
    categoryId: 1,
    categoryName: '大屏设计',
    style: '中心聚焦型',
    prompt:
      '设计一张指挥中心数据大屏，采用中心聚焦型布局：画面正中是一个超大号的核心 KPI 数字（今日综合达成率），四周以三圈同心圆环环绕分布六个卫星指标卡（接入设备、待处理告警、平均响应、今日工单、用户满意度、在线率）。整体深蓝底色，青色与亮蓝作为高亮色，指标卡带细边框与微光效果，风格参考科幻指挥舱 HUD 界面，构图对称、重心稳定，16:9 横版。',
    htmlSource: HUD_HTML,
    images: [
      { id: 11, url: IMG.hudScreen, isMain: true },
      { id: 12, url: IMG.radar, isMain: false },
    ],
    tags: ['数据可视化', '深色', 'HUD'],
    status: 'PUBLISHED',
    publishedAt: '2026-09-12',
    createdAt: '2026-09-12',
    viewCount: 342,
    copyCount: 58,
  },
  {
    id: 2,
    title: '带透视景深的 3D 卡片轮播',
    summary: '近大远小 + 轻微俯角，切换时卡片沿弧线运动，支持拖拽惯性。',
    categoryId: 2,
    categoryName: '轮播',
    style: '3D 旋转木马',
    prompt:
      '实现一个 3D 旋转木马轮播组件：卡片以 coverflow 方式排列，中心卡片最大最亮，两侧卡片依次缩小、降低透明度并向后倾斜，形成透视景深。切换时卡片沿弧线平滑运动，支持鼠标拖拽与惯性滑动，底部配指示圆点。',
    images: [{ id: 21, url: IMG.carousel, isMain: true }],
    tags: ['动效', 'CSS 3D'],
    status: 'PUBLISHED',
    publishedAt: '2026-09-08',
    createdAt: '2026-09-08',
    viewCount: 268,
    copyCount: 41,
  },
  {
    id: 3,
    title: 'SaaS 产品落地页：左文右图经典分栏',
    summary: '左侧大标题 + 行动按钮 + 信任背书，右侧产品截图带浮动阴影。',
    categoryId: 3,
    categoryName: '落地页',
    style: '左右分栏型',
    prompt:
      '设计一个 SaaS 产品落地页首屏，左右分栏布局：左侧为大标题、副标题、主行动按钮与客户信任背书，右侧为带浮动阴影的产品截图。整体浅色极简风格，留白充足，分栏比例约 5:7。',
    images: [{ id: 31, url: IMG.saas, isMain: true }],
    tags: ['SaaS', '首屏'],
    status: 'PUBLISHED',
    publishedAt: '2026-09-05',
    createdAt: '2026-09-05',
    viewCount: 231,
    copyCount: 36,
  },
  {
    id: 4,
    title: '均衡网格数据大屏：模块等分、留白呼吸',
    summary: '十二栅格划分功能模块，卡片等高对齐，浅色主题适合汇报场景。',
    categoryId: 1,
    categoryName: '大屏设计',
    style: '网格模块型',
    prompt:
      '设计一张浅色主题数据大屏，采用网格模块型布局：十二栅格划分功能模块，卡片等高对齐、留白均匀，模块间用细分割线区隔，数据以折线图与柱状图为主，整体干净适合汇报演示。',
    images: [{ id: 41, url: IMG.grid, isMain: true }],
    tags: ['浅色', 'B 端'],
    status: 'PUBLISHED',
    publishedAt: '2026-08-30',
    createdAt: '2026-08-30',
    viewCount: 198,
    copyCount: 27,
  },
  {
    id: 5,
    title: '业务链路可视化：节点流转 + 状态染色',
    summary: '横向链路表达业务流转，异常节点红色高亮，配合流向粒子动效。',
    categoryId: 1,
    categoryName: '大屏设计',
    style: '流程链路型',
    prompt:
      '设计一张业务链路可视化大屏，采用流程链路型布局：横向主链路串联各业务节点，节点带图标与关键数据，异常节点红色高亮并脉冲提醒，链路上有流向粒子动效，深色科技风。',
    images: [{ id: 51, url: IMG.flow, isMain: true }],
    tags: ['链路图', 'SVG'],
    status: 'PUBLISHED',
    publishedAt: '2026-08-26',
    createdAt: '2026-08-26',
    viewCount: 187,
    copyCount: 29,
  },
  {
    id: 6,
    title: '大字报式极简首屏：衬线大标题 + 大留白',
    summary: '只用字号与留白建立层级，一句 slogan 一张图，克制而有力量。',
    categoryId: 3,
    categoryName: '落地页',
    style: '杂志排版型',
    prompt:
      '设计一个极简杂志风落地页首屏：衬线体超大标题居中，仅一句 slogan 与一张小图，大量留白建立层级，无多余装饰，克制而有力量。',
    images: [{ id: 61, url: IMG.editorial, isMain: true }],
    tags: ['排版', '极简'],
    status: 'PUBLISHED',
    publishedAt: '2026-08-22',
    createdAt: '2026-08-22',
    viewCount: 154,
    copyCount: 22,
  },
  {
    id: 7,
    title: '上总下分监控屏：顶部总览条 + 下部明细区',
    summary: '顶部横向铺开五个总览指标，下方三栏明细支撑，总分结构清晰。',
    categoryId: 1,
    categoryName: '大屏设计',
    style: '上总下分型',
    prompt:
      '设计一张监控数据大屏，采用上总下分布局：顶部横向铺开五个总览指标卡，下方三栏分别放置明细表格、趋势图与排名列表，浅蓝商务风，层级清晰。',
    images: [{ id: 71, url: IMG.topDown, isMain: true }],
    tags: ['监控', '总分结构'],
    status: 'PUBLISHED',
    publishedAt: '2026-08-18',
    createdAt: '2026-08-18',
    viewCount: 176,
    copyCount: 25,
  },
  {
    id: 8,
    title: '登录页玻璃拟态卡片（待完善）',
    summary: '渐变底上的磨砂玻璃登录卡片，毛玻璃效果与光斑点缀。',
    categoryId: 8,
    categoryName: '登录注册',
    style: '玻璃拟态',
    prompt:
      '设计一个玻璃拟态风格登录页：渐变底色上有漂浮光斑，登录卡片使用磨砂玻璃效果（backdrop-filter），输入框与按钮带半透明质感。',
    images: [
      {
        id: 81,
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20glassmorphism%20login%20card%20on%20gradient%20background%2C%20frosted%20glass%20effect%2C%20modern%20web%20design&image_size=landscape_4_3',
        isMain: true,
      },
    ],
    tags: ['玻璃拟态', '渐变'],
    status: 'DRAFT',
    createdAt: '2026-09-02',
    viewCount: 0,
    copyCount: 0,
  },
]

let nextEntryId = 100
let nextCategoryId = 100

function syncCategoryMeta(): void {
  for (const category of mockCategories) {
    category.entryCount = rawEntries.filter((entry) => entry.categoryId === category.id).length
  }
  mockCategories.sort((a, b) => a.sort - b.sort)
}
syncCategoryMeta()

function categoryNameOf(id: number): string {
  return mockCategories.find((category) => category.id === id)?.name ?? ''
}

export function mockListCategories(): Promise<Category[]> {
  syncCategoryMeta()
  return delay(mockCategories.map((category) => ({ ...category })))
}

export function mockCreateCategory(name: string): Promise<Category> {
  const created: Category = { id: nextCategoryId++, name, sort: mockCategories.length + 1 }
  mockCategories.push(created)
  return delay({ ...created })
}

export function mockUpdateCategory(id: number, name: string): Promise<void> {
  const category = mockCategories.find((item) => item.id === id)
  if (!category) return Promise.reject(new Error('分类不存在'))
  category.name = name
  for (const entry of rawEntries) {
    if (entry.categoryId === id) entry.categoryName = name
  }
  return delay(undefined)
}

export function mockSortCategories(ids: number[]): Promise<void> {
  ids.forEach((id, index) => {
    const category = mockCategories.find((item) => item.id === id)
    if (category) category.sort = index + 1
  })
  mockCategories.sort((a, b) => a.sort - b.sort)
  return delay(undefined)
}

export function mockRemoveCategory(id: number): Promise<void> {
  const index = mockCategories.findIndex((item) => item.id === id)
  if (index === -1) return Promise.reject(new Error('分类不存在'))
  const count = rawEntries.filter((entry) => entry.categoryId === id).length
  if (count > 0) return Promise.reject(new Error(`该分类下还有 ${count} 个案例，无法删除`))
  mockCategories.splice(index, 1)
  return delay(undefined)
}

export function mockPageEntries(params: MockPageParams): Promise<PageResult<Entry>> {
  let list = [...rawEntries]
  if (params.status) {
    list = list.filter((entry) => entry.status === params.status)
  }
  if (params.categoryId !== undefined) {
    list = list.filter((entry) => entry.categoryId === params.categoryId)
  }
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(
      (entry) =>
        entry.title.toLowerCase().includes(keyword) ||
        entry.summary.toLowerCase().includes(keyword) ||
        entry.prompt.toLowerCase().includes(keyword) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(keyword)),
    )
  }
  list.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
  const total = list.length
  const start = (params.page - 1) * params.size
  return delay({
    list: list.slice(start, start + params.size).map((entry) => ({ ...entry })),
    total,
    page: params.page,
    size: params.size,
  })
}

export function mockGetEntry(id: number): Promise<Entry> {
  const entry = rawEntries.find((item) => item.id === id)
  if (!entry) return Promise.reject(new Error('案例不存在或未发布'))
  return delay({ ...entry })
}

export function mockCreateEntry(data: Partial<Entry>): Promise<Entry> {
  const status: MockEntryStatus = data.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  const entry: Entry = {
    id: nextEntryId++,
    title: data.title ?? '',
    summary: data.summary ?? '',
    categoryId: data.categoryId ?? mockCategories[0].id,
    categoryName: categoryNameOf(data.categoryId ?? mockCategories[0].id),
    style: data.style ?? '',
    prompt: data.prompt ?? '',
    htmlSource: data.htmlSource,
    images: data.images ?? [],
    tags: data.tags ?? [],
    status,
    publishedAt: status === 'PUBLISHED' ? today() : undefined,
    createdAt: today(),
    viewCount: 0,
    copyCount: 0,
  }
  rawEntries.unshift(entry)
  syncCategoryMeta()
  return delay({ ...entry })
}

export function mockUpdateEntry(id: number, data: Partial<Entry>): Promise<void> {
  const entry = rawEntries.find((item) => item.id === id)
  if (!entry) return Promise.reject(new Error('案例不存在'))
  const { status } = data
  Object.assign(entry, { ...data, status: undefined })
  if (status === 'PUBLISHED' || status === 'DRAFT') {
    entry.status = status
    if (status === 'PUBLISHED' && !entry.publishedAt) entry.publishedAt = today()
  }
  entry.categoryName = categoryNameOf(entry.categoryId)
  syncCategoryMeta()
  return delay(undefined)
}

export function mockUpdateEntryStatus(id: number, status: MockEntryStatus): Promise<void> {
  const entry = rawEntries.find((item) => item.id === id)
  if (!entry) return Promise.reject(new Error('案例不存在'))
  entry.status = status
  if (status === 'PUBLISHED' && !entry.publishedAt) entry.publishedAt = today()
  return delay(undefined)
}

export function mockRemoveEntry(id: number): Promise<void> {
  const index = rawEntries.findIndex((item) => item.id === id)
  if (index === -1) return Promise.reject(new Error('案例不存在'))
  rawEntries.splice(index, 1)
  syncCategoryMeta()
  return delay(undefined)
}

export function mockRelated(id: number): Promise<Entry[]> {
  const self = rawEntries.find((item) => item.id === id)
  if (!self) return delay([])
  const related = rawEntries
    .filter(
      (entry) =>
        entry.categoryId === self.categoryId && entry.id !== id && entry.status === 'PUBLISHED',
    )
    .slice(0, 2)
    .map((entry) => ({ ...entry }))
  return delay(related)
}

export function mockOverview(): Promise<MockOverview> {
  syncCategoryMeta()
  const published = rawEntries.filter((entry) => entry.status === 'PUBLISHED')
  const recent = [...published]
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
    .slice(0, 5)
    .map((entry) => ({ ...entry }))
  return delay({
    published: published.length,
    drafts: rawEntries.length - published.length,
    categories: mockCategories.length,
    totalViews: rawEntries.reduce((sum, entry) => sum + (entry.viewCount ?? 0), 0),
    recent,
  })
}
