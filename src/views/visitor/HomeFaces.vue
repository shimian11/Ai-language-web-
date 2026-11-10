<template>
  <!-- 首页：四面横向景深轮播（提示词 / 心得 / 实习 / 面试） -->
  <div class="home-page visitor-page">
    <!-- 背景视差层：光斑与网格随切换位移，制造纵深 -->
    <div class="backdrop" aria-hidden="true">
      <div ref="blob1" class="blob b1"></div>
      <div ref="blob2" class="blob b2"></div>
      <div ref="blob3" class="blob b3"></div>
      <div ref="gridBg" class="grid-bg"></div>
    </div>

    <main class="stage-wrap">
      <!-- 首屏文案 -->
      <div class="intro">
        <div class="eyebrow">Personal Blog · 2026</div>
        <h1>斑马QAQ 的<em>个人博客</em></h1>
        <p>AI 网页设计提示词，以及真实的实习、面试与成长记录。</p>
      </div>

      <!-- 轮播舞台 -->
      <div
        ref="stageRef"
        class="stage"
        :class="{ dragging }"
        aria-roledescription="横向主题轮播"
      >
        <div ref="deckRef" class="deck">
          <article
            v-for="(face, i) in faces"
            :key="face.key"
            :ref="(el) => setFaceRef(el, i)"
            class="face"
            :class="{ 'is-active': i === index }"
            :aria-hidden="i === index ? 'false' : 'true'"
          >
            <div class="card">
              <!-- 边框流动光效：独立图层只旋转圆盘，不触发文字重绘 -->
              <div class="flow" aria-hidden="true"><i></i></div>
              <div class="art">
                <div class="issue">Issue 0{{ i + 1 }} — 2026</div>

                <!-- 各面专属封面图形（纯 CSS） -->
                <div v-if="face.key === 'prompts'" class="stack">
                  <div class="win a"><i></i><i></i><i></i></div>
                  <div class="win b"><i></i><i></i><i></i></div>
                  <div class="win c"><i></i><i></i><i></i></div>
                </div>
                <div v-else-if="face.key === 'notes'" class="stack">
                  <div class="sheet a"></div>
                  <div class="sheet b"></div>
                  <div class="sheet c"></div>
                </div>
                <div v-else-if="face.key === 'internship'" class="stack">
                  <div class="tl">
                    <b></b><b></b><b></b>
                    <span>入职</span><span>上手</span><span>独立</span>
                  </div>
                </div>
                <div v-else class="stack">
                  <div class="bubble a"></div>
                  <div class="bubble b"></div>
                </div>

                <div class="num">0{{ i + 1 }} / {{ face.en }}</div>
              </div>

              <div class="body">
                <div class="kicker">{{ face.enLabel }}</div>
                <h2>{{ face.title }}</h2>
                <p class="desc">{{ face.desc }}</p>
                <ul class="mini">
                  <li v-for="m in face.mini" :key="m">
                    <b>{{ face.miniNo }}</b><i>{{ m }}</i>
                  </li>
                </ul>
                <div class="foot">
                  <span>{{ face.foot }}</span>
                  <span class="go">进入</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- 控制区：数字进度（无箭头） -->
      <div class="controls">
        <div class="track" role="tablist" aria-label="主题切换">
          <button
            v-for="(face, i) in faces"
            :key="face.key"
            type="button"
            role="tab"
            :class="{ on: i === index }"
            :aria-selected="i === index ? 'true' : 'false'"
            :aria-label="`第 ${i + 1} 个主题：${face.title}`"
            @click="go(i)"
          >
            0{{ i + 1 }}
          </button>
        </div>
        <div class="hint">拖拽 / 横向滚轮 / ← → / 点击卡片或两侧空白切换</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useFaceWheel } from '@/composables/useFaceWheel'

/** 单面配置：文案与跳转目标 */
interface FaceConfig {
  key: 'prompts' | 'notes' | 'internship' | 'interview'
  en: string
  enLabel: string
  title: string
  desc: string
  miniNo: string
  mini: string[]
  foot: string
  link: string
}

/** 四个主题面的静态配置（内容计数与各列表页一致） */
const faces: FaceConfig[] = [
  {
    key: 'prompts',
    en: 'PROMPTS',
    enLabel: 'Prompt Library',
    title: '提示词',
    desc: '把「想要的效果」拆成可复现的指令，附 HTML 源码与实时预览。',
    miniNo: '01',
    mini: ['首屏 · 对齐方式', '空状态 · 搜索', '分组 · 移动端'],
    foot: '14 个案例 · 标签检索',
    link: '/prompts',
  },
  {
    key: 'notes',
    en: 'NOTES',
    enLabel: 'Notes & Thoughts',
    title: '心得',
    desc: '做项目踩的坑、用 AI 的真实体会、学习方法，分开装。',
    miniNo: '01',
    mini: ['项目实战 · 2 篇', 'AI 使用 · 2 篇', '学习方法 · 4 篇'],
    foot: '3 个栏目 · 8 篇',
    link: '/notes',
  },
  {
    key: 'internship',
    en: 'INTERNSHIP',
    enLabel: 'Internship Log',
    title: '实习',
    desc: '从课堂到工位：横向时间线选公司，竖向时间线读记录。',
    miniNo: '01',
    mini: ['某创业公司 · 全栈 · 2 篇', '某大厂 · 前端 · 2 篇', '阶段总结 · 1 篇'],
    foot: '2 段经历 · 5 篇记录',
    link: '/internship',
  },
  {
    key: 'interview',
    en: 'INTERVIEW',
    enLabel: 'Interview Review',
    title: '面试',
    desc: '面经分享、高频八股与手写算法，三个栏目持续更新。',
    miniNo: '01',
    mini: ['面经分享 · 4 篇（附解读）', '八股考题 · 高频真题清单', '算法题 · 手写与易错点'],
    foot: '3 个栏目 · 10 篇',
    link: '/interview',
  },
]

/**
 * 强景深参数表（按与当前面的偏移量取值）
 * 中心最大最亮；两侧缩小、后退、侧转、压暗、模糊；更远近乎隐去
 */
const DEPTH = [
  { x: 0, s: 1, z: 0, o: 1, b: 1, sat: 1, blur: 0, ry: 0 },
  { x: 84, s: 0.72, z: -280, o: 0.55, b: 0.62, sat: 0.8, blur: 2.6, ry: -16 },
  { x: 142, s: 0.6, z: -460, o: 0.16, b: 0.45, sat: 0.6, blur: 5, ry: -24 },
  { x: 190, s: 0.52, z: -620, o: 0, b: 0.4, sat: 0.5, blur: 6, ry: -30 },
]

const router = useRouter()

/* ---------- 模板引用 ---------- */
const stageRef = ref<HTMLElement | null>(null)
const deckRef = ref<HTMLElement | null>(null)
const blob1 = ref<HTMLElement | null>(null)
const blob2 = ref<HTMLElement | null>(null)
const blob3 = ref<HTMLElement | null>(null)
const gridBg = ref<HTMLElement | null>(null)
const faceEls: (HTMLElement | null)[] = []

/** 函数式 ref：收集四个面元素 */
function setFaceRef(el: unknown, i: number): void {
  faceEls[i] = el as HTMLElement | null
}

/* ---------- 交互状态 ---------- */
/* index 必须是响应式：模板的 is-active / aria-hidden 都绑定它。
   此前用 let 非响应式变量，卡片 CSS 变量在动但高亮/流光永远停在第一张。 */
const index = ref(0)
let dragPx = 0
let startX = 0
let dragging = false
let moved = false
let captured = false
let tiltRaf = 0

/** 应用当前 index 的景深与视差 */
function render(): void {
  const cur = index.value
  faceEls.forEach((el, i) => {
    if (!el) return
    const off = i - cur
    const abs = Math.abs(off)
    const d = DEPTH[Math.min(abs, 3)]
    const dir = Math.sign(off)
    el.style.setProperty('--x', String(d.x * dir))
    el.style.setProperty('--s', String(d.s))
    el.style.setProperty('--z', `${d.z}px`)
    el.style.setProperty('--o', abs > 3 ? '0' : String(d.o))
    el.style.setProperty('--b', String(d.b))
    el.style.setProperty('--sat', String(d.sat))
    el.style.setProperty('--blur', `${d.blur}px`)
    el.style.setProperty('--ry', `${d.ry * dir}deg`)
  })
  // 背景视差：每个光斑位移幅度不同，网格同步
  const shifts = [blob1.value, blob2.value, blob3.value]
  shifts.forEach((b, i) => b?.style.setProperty('--px', `${-cur * (18 + i * 10)}px`))
  gridBg.value?.style.setProperty('--gx', `${-cur * 26}px`)
}

/** 跳到指定面（带边界收敛） */
function go(next: number): void {
  index.value = Math.max(0, Math.min(faces.length - 1, next))
  render()
}
/** 步进 ±1 */
function step(dir: number): void {
  go(index.value + dir)
}

/* ---------- 指针：拖拽与点击的分工 ----------
   位移 ≤14px → 未捕获指针，浏览器正常派发 click（点侧卡居中、点中心卡进入）
   位移 >14px → 捕获指针进入拖拽；松开时 ≥80px 切换，否则弹回 */
function onDown(e: PointerEvent): void {
  if (window.innerWidth <= 820) return
  dragging = true
  moved = false
  captured = false
  startX = e.clientX
  dragPx = 0
  stageRef.value?.classList.add('dragging')
  deckRef.value?.classList.add('no-anim')
  faceEls.forEach((f) => f?.classList.add('no-anim'))
}

function onMove(e: PointerEvent): void {
  if (!dragging) return
  dragPx = e.clientX - startX
  if (Math.abs(dragPx) > 14) {
    moved = true
    if (!captured) {
      stageRef.value?.setPointerCapture?.(e.pointerId)
      captured = true
    }
  }
  // 拖拽阻力：越拖越重，并让整个舞台轻微转体
  const resist = Math.min(Math.abs(dragPx), 260) / 260
  const applied = dragPx * (0.9 - resist * 0.25)
  faceEls.forEach((f) => f?.style.setProperty('--drag', String(applied)))
  deckRef.value?.style.setProperty('--deck-ry', `${-applied * 0.045}deg`)
}

function onUp(): void {
  if (!dragging) return
  dragging = false
  stageRef.value?.classList.remove('dragging')
  if (dragPx <= -80) step(1)
  else if (dragPx >= 80) step(-1)
  dragPx = 0
  startX = 0
  captured = false
  deckRef.value?.classList.remove('no-anim')
  faceEls.forEach((f) => {
    f?.classList.remove('no-anim')
    f?.style.setProperty('--drag', '0')
  })
  deckRef.value?.style.setProperty('--deck-ry', '0deg')
  render()
}

/* ---------- 生命周期挂载 / 卸载 ---------- */
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}
function onTilt(e: MouseEvent): void {
  const active = faceEls[index.value]
  if (!active || window.innerWidth <= 820) return
  const r = active.getBoundingClientRect()
  const ry = ((e.clientX - (r.left + r.width / 2)) / r.width) * 7
  const rx = -((e.clientY - (r.top + r.height / 2)) / r.height) * 5
  cancelAnimationFrame(tiltRaf)
  tiltRaf = requestAnimationFrame(() => {
    const card = active.querySelector('.card') as HTMLElement | null
    card?.style.setProperty('--ry2', `${ry.toFixed(2)}deg`)
    card?.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
  })
}
function onStageClick(e: MouseEvent): void {
  // 卡片之外的中线分侧：左 = 上一张，右 = 下一张
  if (window.innerWidth <= 820) return
  if (moved) {
    moved = false
    return
  }
  const target = e.target as HTMLElement
  if (target.closest('.face')) return
  const stage = stageRef.value
  if (!stage) return
  const rect = stage.getBoundingClientRect()
  if (e.clientX - rect.left < rect.width / 2) step(-1)
  else step(1)
}
function onFaceClick(i: number): void {
  // 拖拽后的 click 抑制；侧卡居中，中心卡进入列表
  if (moved) {
    moved = false
    return
  }
  if (i !== index.value) {
    go(i)
    return
  }
  void router.push(faces[i].link)
}

/* ---------- 滚轮接管：整页无滚动条，滚轮上下都切换卡片 ----------
   原页面可滚动，滚到中部后「上滑/下滑滚轮」行为不一致；
   现在 stage 挂满剩余视口，滚轮事件统一接管为切换（见 composable） */
const { bindWheel, unbindWheel } = useFaceWheel(() => step(1), () => step(-1))

/** 移动端（≤820px）降级为纵向卡片栈：滚动时高亮进入视口的面 */
let mobileObserver: IntersectionObserver | null = null

onMounted(() => {
  const stage = stageRef.value
  if (!stage) return
  // 首页锁定一屏：隐藏 layout 页脚（滚轮接管 + 无滚动条）
  document.body.classList.add('home-fullscreen')
  stage.addEventListener('pointerdown', onDown)
  stage.addEventListener('pointermove', onMove)
  stage.addEventListener('pointerup', onUp)
  stage.addEventListener('pointercancel', onUp)
  stage.addEventListener('click', onStageClick)
  // 滚轮接管：桌面端整页监听（页面本身无滚动条，滚轮只表达切换意图）
  bindWheel(window)
  stage.addEventListener('mousemove', onTilt)
  stage.addEventListener('mouseleave', () => {
    // 鼠标离场：倾角复位
    faceEls.forEach((f) => {
      const card = f?.querySelector('.card') as HTMLElement | null
      card?.style.setProperty('--ry2', '0deg')
      card?.style.setProperty('--rx', '0deg')
    })
  })
  window.addEventListener('keydown', onKeydown)
  faceEls.forEach((el, i) => el?.addEventListener('click', () => onFaceClick(i)))

  render()

  // 移动端（≤820px）降级为纵向卡片栈：滚动时高亮进入视口的面
  if ('IntersectionObserver' in window) {
    mobileObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || window.innerWidth > 820) return
          const i = faceEls.indexOf(en.target as HTMLElement)
          if (i > -1 && i !== index.value) {
            go(i)
          }
        })
      },
      { threshold: 0.45 },
    )
    faceEls.forEach((f) => f && mobileObserver?.observe(f))
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('home-fullscreen')
  const stage = stageRef.value
  if (stage) {
    stage.removeEventListener('pointerdown', onDown)
    stage.removeEventListener('pointermove', onMove)
    stage.removeEventListener('pointerup', onUp)
    stage.removeEventListener('pointercancel', onUp)
    stage.removeEventListener('click', onStageClick)
    stage.removeEventListener('mousemove', onTilt)
  }
  unbindWheel()
  window.removeEventListener('keydown', onKeydown)
  cancelAnimationFrame(tiltRaf)
})
</script>

<style scoped>
/* ================= 背景 ================= */
/* 整页锁定一屏：无滚动条，滚轮只用于切换卡片 */
.home-page {
  /* 覆盖 .visitor-page 的 min-height:100vh；高度 = 100vh − 顶栏(61px) */
  min-height: 0;
  height: calc(100vh - 61px);
  height: calc(100dvh - 61px);
  overflow: hidden;
}
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(34px);
  opacity: 0.65;
  transform: translateX(var(--px, 0px));
  transition: transform 1.1s var(--ease);
}
.blob.b1 {
  width: 46vw;
  height: 46vw;
  left: -8vw;
  top: -12vw;
  background: radial-gradient(circle, rgba(192, 57, 43, 0.16), transparent 66%);
}
.blob.b2 {
  width: 52vw;
  height: 52vw;
  right: -12vw;
  top: 6vh;
  background: radial-gradient(circle, rgba(201, 154, 74, 0.18), transparent 68%);
}
.blob.b3 {
  width: 44vw;
  height: 44vw;
  left: 28vw;
  bottom: -18vw;
  background: radial-gradient(circle, rgba(47, 107, 95, 0.15), transparent 70%);
}
.grid-bg {
  position: absolute;
  inset: -10%;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba(36, 31, 26, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(36, 31, 26, 0.055) 1px, transparent 1px);
  background-size: 52px 52px;
  transform: translateX(var(--gx, 0px)) rotate(-1deg);
  transition: transform 1.2s var(--ease);
  mask-image: radial-gradient(70% 60% at 50% 50%, #000 35%, transparent 100%);
}

/* ================= 舞台 ================= */
.stage-wrap {
  position: relative;
  z-index: 10;
  /* 高度 = home-page 高度（顶栏下方全部空间） */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 0 10px;
}
.intro {
  text-align: center;
  margin-bottom: clamp(10px, 1.6vh, 18px);
  padding: 0 24px;
  animation: rise 0.9s var(--ease) both;
}
.intro .eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  color: var(--ink-3);
  text-transform: uppercase;
}
.intro h1 {
  font-family: var(--serif);
  font-weight: 600;
  letter-spacing: 0.04em;
  font-size: clamp(22px, 2.6vw, 34px);
  margin: 8px 0 6px;
  line-height: 1.18;
}
.intro h1 em {
  font-style: normal;
  color: var(--red);
}
.intro p {
  color: var(--ink-2);
  font-size: 12.5px;
  letter-spacing: 0.04em;
}

.stage {
  position: relative;
  /* 卡片缩小：高度吃剩余空间（减去 intro 与 controls 的预算） */
  height: clamp(360px, calc(100dvh - 60px - 150px), 520px);
  perspective: 1050px;
  perspective-origin: 50% 48%;
  touch-action: pan-y;
  user-select: none;
  cursor: grab;
  animation: rise 0.9s var(--ease) 0.12s both;
}
.stage.dragging {
  cursor: grabbing;
}
.deck {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateY(var(--deck-ry, 0deg));
  transition: transform 0.7s var(--ease);
}
.deck.no-anim {
  transition: none;
}

/* ================= 面 ================= */
.face {
  position: absolute;
  left: 50%;
  top: 50%;
  /* 卡片缩小：宽度收窄、高度贴合舞台 */
  width: clamp(280px, 36vw, 470px);
  height: 100%;
  transform:
    translate(-50%, -50%)
    translateX(calc(var(--x, 0) * 1% + var(--drag, 0) * 1px))
    translateZ(var(--z, 0px))
    rotateY(var(--ry, 0deg))
    scale(var(--s, 1));
  opacity: var(--o, 1);
  transition:
    transform 0.72s var(--ease),
    opacity 0.72s var(--ease),
    filter 0.72s var(--ease);
  will-change: transform, opacity;
}
.face.no-anim {
  transition: none;
}
/* 只有非当前面才压暗/模糊：当前面不套 filter，避免文字被反复栅格化 */
.face:not(.is-active) {
  filter: brightness(var(--b, 1)) saturate(var(--sat, 1)) blur(var(--blur, 0px));
}

/* ================= 面板 ================= */
.card {
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 2px 0 var(--line), 0 26px 60px rgba(58, 43, 28, 0.18);
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry2, 0deg));
  transition: transform 0.5s var(--spring), box-shadow 0.3s ease-out;
}
/* 边框流动光效：独立图层，只旋转内部圆盘（transform 合成） */
.flow {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  border-radius: inherit;
  padding: 2px;
  overflow: hidden;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.55s var(--ease);
  isolation: isolate;
  contain: paint;
}
.flow i {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 180%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0 34%,
    rgba(192, 57, 43, 0.75) 58%,
    rgba(201, 154, 74, 0.95) 70%,
    rgba(47, 107, 95, 0.55) 80%,
    transparent 90%
  );
  transform: translate(-50%, -50%) rotate(0deg);
  animation: spin 3.6s linear infinite;
  will-change: transform;
}
.face.is-active .flow {
  opacity: 1;
}
@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
/* 当前面：静态投影（不做 box-shadow 动画，避免文字发虚） */
.face.is-active .card {
  box-shadow:
    0 2px 0 var(--line),
    0 34px 74px rgba(58, 43, 28, 0.24),
    0 0 26px rgba(192, 57, 43, 0.1);
}
.face:not(.is-active):hover .card {
  transform: translateY(-8px) scale(1.03);
}

/* ================= 封面视觉区 ================= */
.art {
  position: relative;
  flex: 0 0 38%;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 18% 0%, color-mix(in srgb, var(--red) 11%, transparent), transparent 62%),
    radial-gradient(110% 90% at 92% 100%, color-mix(in srgb, var(--green) 10%, transparent), transparent 58%),
    var(--paper-2);
  border-bottom: 1px solid var(--line);
}
.art::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.55;
  background-image:
    linear-gradient(color-mix(in srgb, var(--ink) 8%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--ink) 8%, transparent) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(78% 78% at 50% 45%, #000 22%, transparent 100%);
}
.art .num {
  position: absolute;
  left: 26px;
  bottom: 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ink-2);
}
.art .issue {
  position: absolute;
  right: 22px;
  top: 16px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--ink-3);
  text-transform: uppercase;
}
.stack {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

/* 提示词：三扇小窗 */
.win {
  position: absolute;
  width: 38%;
  height: 52%;
  border-radius: 6px;
  border: 1px solid rgba(36, 31, 26, 0.24);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 10px 0 rgba(36, 31, 26, 0.06), 0 16px 26px rgba(58, 43, 28, 0.14);
}
.win.a { transform: translate(-54px, 6px) rotate(-6deg); }
.win.b { transform: translate(0, -14px); z-index: 2; background: rgba(255, 255, 255, 0.8); }
.win.c { transform: translate(54px, 14px) rotate(6deg); }
.win i {
  position: absolute;
  left: 12%;
  right: 12%;
  height: 3px;
  border-radius: 2px;
  background: rgba(36, 31, 26, 0.16);
}
.win i:nth-child(1) { top: 22%; }
.win i:nth-child(2) { top: 36%; right: 34%; }
.win i:nth-child(3) { top: 52%; height: 10px; background: color-mix(in srgb, var(--red) 18%, transparent); }

/* 心得：叠纸 */
.sheet {
  position: absolute;
  width: 46%;
  height: 62%;
  border-radius: 4px;
  background: #fdfaf4;
  border: 1px solid rgba(36, 31, 26, 0.14);
  box-shadow: 0 12px 0 rgba(36, 31, 26, 0.05), 0 20px 30px rgba(58, 43, 28, 0.14);
}
.sheet.a { transform: translate(-30px, 10px) rotate(-5deg); opacity: 0.65; }
.sheet.b { transform: translate(26px, -6px) rotate(4deg); opacity: 0.82; }
.sheet.c { transform: translate(0, -24px); z-index: 2; }
.sheet.c::after {
  content: '';
  position: absolute;
  left: 12%;
  right: 12%;
  top: 24%;
  bottom: 20%;
  background: repeating-linear-gradient(180deg, rgba(36, 31, 26, 0.22) 0 2px, transparent 2px 13px);
}
.sheet.c::before {
  content: '04';
  position: absolute;
  left: 10%;
  top: 8%;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--ink-3);
  letter-spacing: 0.16em;
}

/* 实习：时间轴 */
.tl {
  position: absolute;
  left: 12%;
  right: 12%;
  top: 46%;
  height: 2px;
  background: rgba(36, 31, 26, 0.22);
}
.tl b {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: var(--red);
  box-shadow: 0 0 0 6px rgba(192, 57, 43, 0.1);
}
.tl b:nth-child(1) { left: 0; }
.tl b:nth-child(2) { left: 50%; background: var(--gold); }
.tl b:nth-child(3) { left: 100%; background: var(--green); }
.tl span {
  position: absolute;
  top: 24px;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--ink-2);
  white-space: nowrap;
}
.tl span:nth-of-type(1) { left: 0; }
.tl span:nth-of-type(2) { left: 50%; }
.tl span:nth-of-type(3) { left: 100%; }

/* 面试：对话气泡 */
.bubble {
  position: absolute;
  border-radius: 14px;
  border: 1px solid rgba(36, 31, 26, 0.18);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 10px 0 rgba(36, 31, 26, 0.04), 0 16px 26px rgba(58, 43, 28, 0.12);
}
.bubble.a { width: 46%; height: 28%; left: 10%; top: 20%; }
.bubble.b { width: 40%; height: 24%; right: 8%; bottom: 22%; background: color-mix(in srgb, var(--red) 12%, #fff); }
.bubble::after {
  content: '';
  position: absolute;
  left: 16%;
  bottom: 34%;
  width: 58%;
  height: 3px;
  background: rgba(36, 31, 26, 0.18);
  box-shadow: 0 10px 0 rgba(36, 31, 26, 0.12);
}

/* ================= 文字区 ================= */
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 18px 22px 16px;
  min-height: 0;
}
.kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--ink-3);
  text-transform: uppercase;
}
.kicker::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}
.body h2 {
  font-family: var(--serif);
  font-size: clamp(19px, 1.7vw, 25px);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 9px 0 6px;
  line-height: 1.25;
}
.desc {
  color: var(--ink-2);
  font-size: 12.5px;
  line-height: 1.7;
  max-width: 34em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mini {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.mini li {
  list-style: none;
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 11.5px;
  color: var(--ink);
}
.mini li b {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--red);
  font-weight: 500;
}
.mini li i {
  font-style: normal;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.foot {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--ink-2);
  letter-spacing: 0.04em;
}
.foot .go {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink);
  font-size: 12px;
}
.foot .go::after {
  content: '→';
  color: var(--red);
}

/* ================= 控制区 ================= */
.controls {
  position: relative;
  z-index: 20;
  margin-top: clamp(10px, 1.8vh, 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.track {
  display: flex;
  gap: 20px;
}
.track button {
  border: 0;
  background: transparent;
  padding: 4px 2px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ink-3);
  position: relative;
  transition: color 0.25s;
}
.track button::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s var(--ease);
}
.track button.on {
  color: var(--ink);
}
.track button.on::after {
  transform: scaleX(1);
}
.hint {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  opacity: 0.85;
}

/* ================= 入场与响应式 ================= */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (max-width: 820px) {
  /* 移动端恢复纵向滚动浏览（滚轮接管仅桌面端） */
  .home-page {
    height: auto;
    overflow: visible;
  }
  .stage-wrap {
    height: auto;
    padding: 76px 0 40px;
  }
  .stage {
    height: auto;
    perspective: none;
    cursor: default;
  }
  .deck {
    position: static;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 18px;
    transform: none !important;
  }
  .face {
    position: static;
    width: 100%;
    height: auto;
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
    transition: none;
  }
  .card {
    min-height: 420px;
  }
  .face:not(.is-active) .card {
    box-shadow: 0 2px 0 var(--line), 0 16px 40px rgba(58, 43, 28, 0.14);
  }
  .controls {
    display: none;
  }
  .intro {
    margin-bottom: 20px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .face,
  .card,
  .track button,
  .track button::after,
  .blob,
  .grid-bg {
    transition: none !important;
  }
  .flow i {
    animation: none;
  }
  .intro,
  .stage {
    animation: none;
  }
}
</style>
