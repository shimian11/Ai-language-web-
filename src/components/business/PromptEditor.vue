<template>
  <div ref="editorRef" class="prompt-editor"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = withDefaults(
  defineProps<{
    modelValue: string
    height?: number
    placeholder?: string
  }>(),
  { height: 360, placeholder: '输入提示词（支持 Markdown）…' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<HTMLDivElement | null>(null)
let instance: Vditor | null = null
let ready = false

onMounted(() => {
  instance = new Vditor(editorRef.value as HTMLElement, {
    mode: 'ir',
    height: props.height,
    placeholder: props.placeholder,
    value: props.modelValue,
    cache: { enable: false },
    counter: { enable: true },
    after: () => {
      ready = true
      instance?.setValue(props.modelValue)
    },
    input: (value) => {
      emit('update:modelValue', value)
    },
  })
})

// 编辑模式异步回填表单后，同步编辑器内容
watch(
  () => props.modelValue,
  (value) => {
    if (ready && instance && instance.getValue() !== value) {
      instance.setValue(value)
    }
  },
)

onBeforeUnmount(() => {
  instance?.destroy()
  instance = null
})
</script>

<style scoped>
.prompt-editor {
  --panel-border-color: var(--line);
  border: 1px solid var(--line);
  border-radius: 9px;
  overflow: hidden;
}
</style>
