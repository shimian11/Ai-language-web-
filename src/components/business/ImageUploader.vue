<template>
  <div class="uploader">
    <div
      class="dropzone"
      :class="{ disabled }"
      @click="inputRef?.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div class="icon">⬆️</div>
      <div class="t1">拖拽图片到这里，或点击上传</div>
      <div class="t2">支持 jpg / png / webp，单张 ≤ 5MB</div>
    </div>
    <input
      ref="inputRef"
      class="hidden-input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      :disabled="disabled"
      @change="onChange"
    />

    <div v-if="modelValue.length" class="uploads">
      <div v-for="(image, index) in modelValue" :key="image.id" class="upload">
        <img :src="image.url" alt="效果图" />
        <span v-if="image.isMain" class="main-flag">主图</span>
        <div class="ops">
          <button
            class="op"
            :class="{ highlight: !image.isMain }"
            type="button"
            :disabled="disabled"
            @click="setMain(index)"
          >
            设为主图
          </button>
          <button class="op" type="button" :disabled="disabled" @click="removeImage(index)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import type { EntryImage } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue: EntryImage[]
    upload: (file: File) => Promise<{ url: string }>
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: EntryImage[]] }>()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

const inputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

function emitValue(value: EntryImage[]): void {
  emit('update:modelValue', value)
}

function validate(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    ElMessage.error(`不支持的图片格式：${file.name}`)
    return false
  }
  if (file.size > MAX_SIZE) {
    ElMessage.error(`图片超过 5MB 限制：${file.name}`)
    return false
  }
  return true
}

async function handleFiles(files: File[]): Promise<void> {
  if (props.disabled || uploading.value || !files.length) return
  uploading.value = true
  const next = [...props.modelValue]
  try {
    for (const file of files) {
      if (!validate(file)) continue
      const { url } = await props.upload(file)
      next.push({ id: -Date.now() - next.length, url, isMain: next.length === 0 })
    }
    emitValue(next)
  } finally {
    uploading.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}

function onChange(event: Event): void {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  handleFiles(files)
}

function onDrop(event: DragEvent): void {
  const files = Array.from(event.dataTransfer?.files ?? [])
  handleFiles(files)
}

function setMain(index: number): void {
  emitValue(props.modelValue.map((image, i) => ({ ...image, isMain: i === index })))
}

function removeImage(index: number): void {
  const next = props.modelValue.filter((_, i) => i !== index)
  if (props.modelValue[index]?.isMain && next.length) {
    next[0] = { ...next[0], isMain: true }
  }
  emitValue(next)
}
</script>

<style scoped>
.dropzone {
  border: 1.5px dashed #cfc9bd;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: 0.15s;
  background: var(--bg);
}

.dropzone:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.dropzone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.icon {
  font-size: 24px;
}

.t1 {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.t2 {
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-2);
}

.hidden-input {
  display: none;
}

.uploads {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.upload {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}

.upload img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.main-flag {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 10.5px;
  background: var(--accent);
  color: #fff;
  border-radius: 5px;
  padding: 2px 7px;
  font-weight: 600;
}

.ops {
  display: flex;
  border-top: 1px solid var(--line);
}

.op {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 11.5px;
  color: var(--ink-2);
  padding: 6px 0;
  cursor: pointer;
}

.op:first-child {
  border-right: 1px solid var(--line);
}

.op.highlight {
  color: var(--accent-ink);
  font-weight: 600;
}

.op:hover {
  color: var(--accent-ink);
  background: var(--bg);
}
</style>
