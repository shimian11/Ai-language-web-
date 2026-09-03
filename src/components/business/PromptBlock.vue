<template>
  <div class="prompt-block">
    <div class="p-head">
      <span class="label">{{ label }}</span>
      <button class="copy-btn" :class="{ done: copied }" type="button" @click="onCopy">
        {{ copied ? '✓ 已复制' : '⧉ 复制提示词' }}
      </button>
    </div>
    <div class="prompt-text">{{ prompt }}</div>
    <div v-if="$slots.footer" class="p-foot">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useCopy } from '@/composables/useCopy'

const props = withDefaults(
  defineProps<{
    prompt: string
    label?: string
  }>(),
  { label: '' },
)

const { copy } = useCopy()
const copied = ref(false)

function onCopy(): void {
  copy(props.prompt)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1600)
}
</script>

<style scoped>
.prompt-block {
  background: #1e1b16;
  border-radius: var(--radius);
  padding: 16px 16px 14px;
  color: #ede6da;
}

.p-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #a8a08f;
  letter-spacing: 1px;
}

.copy-btn {
  height: 32px;
  padding: 0 15px;
  border-radius: 999px;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;
}

.copy-btn:hover {
  filter: brightness(1.1);
}

.copy-btn.done {
  background: var(--ok);
  border-color: var(--ok);
}

.prompt-text {
  font-family: var(--font-mono);
  font-size: 12.8px;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

.p-foot {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #4a4336;
  font-size: 11px;
  color: #a8a08f;
  display: flex;
  justify-content: space-between;
}
</style>
