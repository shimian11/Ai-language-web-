<template>
  <el-pagination
    background
    layout="total, prev, pager, next, sizes"
    :total="total"
    :current-page="page"
    :page-size="size"
    :page-sizes="[10, 20, 40]"
    @current-change="onPageChange"
    @size-change="onSizeChange"
  />
</template>

<script setup lang="ts">
defineProps<{
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:size': [value: number]
  change: []
}>()

function onPageChange(value: number): void {
  emit('update:page', value)
  emit('change')
}

function onSizeChange(value: number): void {
  emit('update:size', value)
  emit('update:page', 1)
  emit('change')
}
</script>
