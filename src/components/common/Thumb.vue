<template>
  <span class="thumb">
    <img v-if="src" :src="src" :alt="text || '缩略图'" loading="lazy" />
    <span v-else class="thumb-ph" :style="{ background: bg() }">{{ firstChar() }}</span>
  </span>
</template>

<script setup lang="ts">
// 通用缩略图：有图显示图片；无图用「首字彩色占位」，避免浏览器默认破图图标。
// 尺寸由使用方通过 .thumb 的父级容器 / 类控制（宽度+高度/宽高比）。
const props = defineProps<{ src?: string; text?: string }>()

const PALETTE = ['#D4820C', '#2F9E44', '#4263EB', '#9C36B5', '#E8590C', '#1098AD', '#C2255C', '#7048E8']

function firstChar(): string {
  const text = props.text?.trim()
  if (text) return text[0]
  return '图'
}

function bg(): string {
  const text = props.text?.trim()
  let code = 0
  if (text) code = text.charCodeAt(0)
  return PALETTE[code % PALETTE.length]
}
</script>

<style scoped>
.thumb {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-ph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
}
</style>