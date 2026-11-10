<template>
  <!--
    知识图谱视图：主题总点发散文章小点，点击小点进详情。
    布局为确定性极坐标放射状（无外部依赖）；SVG 连线 + 绝对定位节点。
    数据按 tags[0] 聚合为中心主题；tags 为空的文章归入「未分类」。
  -->
  <div ref="wrapRef" class="kg" :style="{ height: graphHeight }">
    <!-- SVG 连线层 -->
    <svg class="kg-lines" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" aria-hidden="true">
      <g
        v-for="hub in layout"
        :key="`l-${hub.key}`"
      >
        <!-- 中心→主题总点 -->
        <line
          :x1="width / 2"
          :y1="height / 2"
          :x2="hub.x"
          :y2="hub.y"
          class="kg-line trunk"
        />
        <!-- 主题→文章小点 -->
        <line
          v-for="leaf in hub.leaves"
          :key="`ll-${leaf.id}`"
          :x1="hub.x"
          :y1="hub.y"
          :x2="leaf.x"
          :y2="leaf.y"
          class="kg-line"
        />
      </g>
    </svg>

    <!-- 节点层 -->
    <!-- 页面中心：栏目名 -->
    <div class="kg-root" :style="rootStyle">
      <span class="kg-root-label">{{ rootLabel }}</span>
    </div>

    <!-- 主题总点（静态节点，仅作知识脉络提示；可点击的是文章小点） -->
    <div
      v-for="hub in layout"
      :key="`h-${hub.key}`"
      class="kg-hub"
      :style="hub.style"
      :title="`${hub.label} · ${hub.leaves.length} 篇`"
    >
      {{ hub.label }}
      <span class="kg-hub-count">{{ hub.leaves.length }}</span>
    </div>

    <!-- 文章小点（可点击进详情） -->
    <button
      v-for="leaf in leaves"
      :key="leaf.id"
      class="kg-leaf"
      :style="leaf.style"
      type="button"
      :title="leaf.title"
      @click="$emit('open', leaf.id)"
    >
      {{ leaf.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/** 图谱入参文章（只需 id/title/tags） */
interface KgArticle {
  id: number
  title: string
  tags: string[]
}

interface LeafNode {
  id: number
  label: string
  title: string
  x: number
  y: number
  style: Record<string, string>
}

interface HubNode {
  key: string
  label: string
  leaves: LeafNode[]
  x: number
  y: number
  style: Record<string, string>
}

const props = defineProps<{
  articles: KgArticle[]
  /** 中心总点文案（如「八股考题」「算法题」） */
  rootLabel: string
  /** 图谱高度（CSS 值） */
  graphHeight?: string
}>()

defineEmits<{
  (e: 'open', id: number): void
}>()

const wrapRef = ref<HTMLElement | null>(null)
const width = ref(1000)
const height = ref(520)

const graphHeight = computed(() => props.graphHeight ?? 'clamp(420px, 56vh, 520px)')

/** 按标签首项聚合主题；空标签归「未分类」 */
const hubs = computed(() => {
  const map = new Map<string, KgArticle[]>()
  for (const a of props.articles) {
    const key = a.tags[0]?.trim() || '未分类'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(a)
  }
  return [...map.entries()]
    .map(([key, list]) => ({ key, label: key, articles: list }))
    .sort((a, b) => b.articles.length - a.articles.length)
})

/** 小点文案：标题去重截断 */
function leafLabel(title: string): string {
  const t = title.replace(/（.*?）/g, '').replace(/[:：].*$/, '').trim()
  return t.length > 10 ? `${t.slice(0, 10)}…` : t
}

/** 三圈椭圆分层布局：中心点 → 主题内圈 → 文章外圈。
 *  每个主题独占一个角度扇区，文章只在该扇区内分布，保证层次清晰、不重叠、不越界。 */
const layout = computed<HubNode[]>(() => {
  const cx = width.value / 2
  const cy = height.value / 2
  const hubCount = hubs.value.length
  const list: HubNode[] = []

  // 外圈椭圆半轴：留出节点文字的半宽/半高余量
  const rxLeaf = Math.max(120, (width.value - 190) / 2)
  const ryLeaf = Math.max(90, (height.value - 88) / 2)
  // 主题圈为外圈的 46%
  const rxHub = rxLeaf * 0.46
  const ryHub = ryLeaf * 0.46
  const sector = (Math.PI * 2) / Math.max(hubCount, 1)

  hubs.value.forEach((hub, hi) => {
    // 主题落在扇区中线（从正上方开始顺时针）
    const angle = -Math.PI / 2 + (hi + 0.5) * sector
    const hx = cx + rxHub * Math.cos(angle)
    const hy = cy + ryHub * Math.sin(angle)

    const n = hub.articles.length
    // 文章角度限制在自己扇区的 62% 内，避免串到相邻主题
    const usable = sector * 0.62
    const leaves: LeafNode[] = hub.articles.map((a, li) => {
      const t = n === 1 ? 0 : li / (n - 1) - 0.5
      const leafAngle = angle + t * usable
      const px = cx + rxLeaf * Math.cos(leafAngle)
      const py = cy + ryLeaf * Math.sin(leafAngle)
      return {
        id: a.id,
        label: leafLabel(a.title),
        title: a.title,
        x: px,
        y: py,
        style: {
          left: `${(px / width.value) * 100}%`,
          top: `${(py / height.value) * 100}%`,
        },
      }
    })

    list.push({
      key: hub.key,
      label: hub.label,
      leaves,
      x: hx,
      y: hy,
      style: {
        left: `${(hx / width.value) * 100}%`,
        top: `${(hy / height.value) * 100}%`,
      },
    })
  })
  return list
})

/** 所有叶子节点（供模板平铺渲染） */
const leaves = computed<LeafNode[]>(() => layout.value.flatMap((h) => h.leaves))

const rootStyle = computed(() => ({
  left: '50%',
  top: '50%',
}))

/** 容器尺寸自适应：取实际渲染宽度 */
let resizeHandler: (() => void) | null = null
onMounted(() => {
  const measure = (): void => {
    if (!wrapRef.value) return
    width.value = Math.max(680, wrapRef.value.clientWidth)
    height.value = Math.max(420, wrapRef.value.clientHeight)
  }
  measure()
  resizeHandler = measure
  window.addEventListener('resize', measure, { passive: true })
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>

<style scoped>
.kg {
  position: relative;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 14px;
  background:
    radial-gradient(90% 80% at 50% 42%, rgba(192, 57, 43, 0.045), transparent 60%),
    repeating-linear-gradient(0deg, transparent 0 31px, var(--line) 31px 32px),
    repeating-linear-gradient(90deg, transparent 0 31px, var(--line) 31px 32px),
    var(--paper-2);
  overflow: hidden;
}

.kg-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.kg-line {
  stroke: rgba(36, 31, 26, 0.2);
  stroke-width: 1.4;
  stroke-dasharray: 4 4;
}

.kg-line.trunk {
  stroke: rgba(192, 57, 43, 0.4);
  stroke-width: 2;
  stroke-dasharray: none;
}

/* 页面中心总点 */
.kg-root {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--paper-2);
  font-family: var(--serif);
  font-size: 14px;
  letter-spacing: 0.1em;
  box-shadow: 0 0 0 10px rgba(36, 31, 26, 0.07), 0 16px 34px rgba(58, 43, 28, 0.25);
  text-align: center;
  line-height: 1.3;
}

.kg-root-label {
  padding: 0 10px;
}

/* 主题总点 */
.kg-hub {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--ink);
  background: var(--paper-2);
  color: var(--ink);
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(58, 43, 28, 0.14);
}

.kg-hub-count {
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: 0.65;
}

/* 文章小点 */
.kg-leaf {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 5;
  max-width: 150px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fffdf8;
  color: var(--ink);
  font-size: 11.5px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 14px rgba(58, 43, 28, 0.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kg-leaf:hover {
  border-color: var(--red);
  color: var(--red);
  background: #fff;
  transform: translate(-50%, -50%) scale(1.09);
  z-index: 6;
}
</style>
