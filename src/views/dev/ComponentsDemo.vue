<template>
  <div class="demo">
    <h1>组件演示 · 阶段 1</h1>
    <p class="note">仅开发环境可访问（/dev/components），用于可视化验证公共组件。</p>

    <section>
      <h2>CategoryPills 分类胶囊墙</h2>
      <CategoryPills v-model="selectedCategory" :categories="categories" />
      <p class="state">当前选中：{{ selectedCategory ?? '全部' }}</p>
    </section>

    <section>
      <h2>EntryCard 案例卡片（双模式缩略图）</h2>
      <div class="card-grid">
        <EntryCard :entry="imageEntry" @open="onCardOpen('图片模式')" />
        <EntryCard :entry="htmlEntry" @open="onCardOpen('HTML 模式')" />
      </div>
    </section>

    <section>
      <h2>PromptBlock 提示词展示与复制</h2>
      <PromptBlock
        :prompt="samplePrompt"
        label="PROMPT · 216 字"
      >
        <template #footer>
          <span>单份提示词 · v1.0</span>
          <span>2026-09-12 定稿</span>
        </template>
      </PromptBlock>
    </section>

    <section>
      <h2>ImageUploader 图片上传（模拟直传）</h2>
      <ImageUploader v-model="images" :upload="fakeUpload" />
    </section>

    <section>
      <h2>PageSkeleton 加载骨架</h2>
      <PageSkeleton :count="4" />
    </section>

    <section>
      <h2>AppPagination 分页</h2>
      <AppPagination v-model:page="page" v-model:size="size" :total="86" @change="onPageChange" />
    </section>

    <section>
      <h2>EmptyState 空状态</h2>
      <EmptyState title="暂无收藏" description="浏览案例时点击「★ 收藏」，它们会出现在这里" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import AppPagination from '@/components/common/AppPagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PageSkeleton from '@/components/common/PageSkeleton.vue'
import CategoryPills from '@/components/business/CategoryPills.vue'
import EntryCard from '@/components/business/EntryCard.vue'
import ImageUploader from '@/components/business/ImageUploader.vue'
import PromptBlock from '@/components/business/PromptBlock.vue'

import type { Category, Entry, EntryImage } from '@/types'

const categories: Category[] = [
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

const selectedCategory = ref<number | undefined>(undefined)

const samplePrompt =
  '设计一张指挥中心数据大屏，采用中心聚焦型布局：画面正中是一个超大号的核心 KPI 数字，四周以三圈同心圆环环绕分布六个卫星指标卡。整体深蓝底色，青色与亮蓝作为高亮色，风格参考科幻指挥舱 HUD 界面，16:9 横版。'

const imageEntry: Entry = {
  id: 1,
  title: 'SaaS 产品落地页：左文右图经典分栏',
  summary: '左侧大标题 + 行动按钮 + 信任背书，右侧产品截图带浮动阴影。',
  categoryId: 3,
  categoryName: '落地页',
  style: '左右分栏型',
  prompt: samplePrompt,
  images: [
    {
      id: 1,
      isMain: true,
      url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20design%20mockup%20of%20a%20SaaS%20landing%20page%20hero%20with%20left-right%20split%20layout%2C%20headline%20on%20left%20product%20screenshot%20on%20right%2C%20minimal%20modern%20design&image_size=landscape_4_3',
    },
  ],
  tags: ['SaaS', '首屏'],
  status: 'PUBLISHED',
  createdAt: '2026-09-05',
}

const htmlEntry: Entry = {
  id: 2,
  title: '指挥中心主视觉大屏：环形数据围绕核心指标',
  summary: '中央放核心 KPI 大数字，四周环绕趋势图与环形占比，一眼锁定重点。',
  categoryId: 1,
  categoryName: '大屏设计',
  style: '中心聚焦型',
  prompt: samplePrompt,
  htmlSource:
    "<!DOCTYPE html><html><head><style>body{margin:0;font-family:system-ui;background:#0B1220;color:#E6EDF3;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}.hud{width:88%;aspect-ratio:16/9;position:relative;border:1px solid #1E3A5F;border-radius:10px;background:radial-gradient(circle at 50% 45%,#10203A,#0B1220)}.kpi{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);text-align:center}.kpi b{font-size:36px;color:#5EEAD4;letter-spacing:1px;animation:pulse 2.4s ease-in-out infinite}.kpi span{display:block;font-size:11px;color:#7C8CA0;margin-top:4px}@keyframes pulse{0%,100%{text-shadow:0 0 0 rgba(94,234,212,0)}50%{text-shadow:0 0 18px rgba(94,234,212,.55)}}.ring{position:absolute;top:50%;left:50%;border:1px solid #1E3A5F;border-radius:50%;animation:rot 14s linear infinite}.r1{width:180px;height:180px;transform:translate(-50%,-50%);border-left-color:#2DD4BF}.r2{width:240px;height:240px;transform:translate(-50%,-50%);border-top-color:#38BDF8;animation-duration:20s;animation-direction:reverse}.r3{width:300px;height:300px;transform:translate(-50%,-50%);border-right-color:#818CF8;animation-duration:26s}@keyframes rot{from{rotate:0deg}to{rotate:360deg}}.sat{position:absolute;width:110px;text-align:center;font-size:10px;color:#7C8CA0}.sat b{display:block;font-size:15px;color:#E6EDF3;margin-bottom:2px}.s1{top:6%;left:50%;transform:translateX(-50%)}.s2{top:42%;left:4%}.s3{top:42%;right:4%}.s4{bottom:5%;left:26%}.s5{bottom:5%;right:26%}</style></head><body><div class='hud'><div class='kpi'><b>98.6%</b><span>今日综合达成率</span></div><div class='ring r1'></div><div class='ring r2'></div><div class='ring r3'></div><div class='sat s1'><b>1,284</b>接入设备</div><div class='sat s2'><b>17</b>待处理告警</div><div class='sat s3'><b>42ms</b>平均响应</div><div class='sat s4'><b>312</b>今日工单</div><div class='sat s5'><b>96%</b>用户满意</div></div></body></html>",
  images: [],
  tags: ['数据可视化', '深色', 'HUD'],
  status: 'PUBLISHED',
  createdAt: '2026-09-12',
}

const images = ref<EntryImage[]>([])

async function fakeUpload(file: File): Promise<{ url: string }> {
  return { url: URL.createObjectURL(file) }
}

const page = ref(1)
const size = ref(20)

function onCardOpen(mode: string): void {
  ElMessage.info(`打开案例详情（${mode}）`)
}

function onPageChange(): void {
  ElMessage.success(`页码：${page.value}，每页：${size.value}`)
}
</script>

<style scoped>
.demo {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 28px 80px;
}

h1 {
  font-size: 26px;
  font-weight: 700;
}

.note {
  margin-top: 8px;
  font-size: 13px;
  color: var(--ink-2);
}

section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

h2 {
  font-size: 17px;
  font-weight: 650;
  margin-bottom: 16px;
}

.state {
  margin-top: 12px;
  font-size: 13px;
  color: var(--accent-ink);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
</style>
