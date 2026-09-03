<template>
  <div class="empty">
    <div class="icon">{{ icon }}</div>
    <div class="title">{{ title }}</div>
    <div v-if="description" class="desc">{{ description }}</div>
    <div v-if="$slots.default" class="action">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    icon?: string
  }>(),
  { title: '暂无内容', description: '', icon: '☆' },
)
</script>

<style scoped>
.empty {
  text-align: center;
  padding: 72px 24px;
}

.icon {
  font-size: 40px;
  opacity: 0.35;
}

.title {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 650;
  color: var(--ink);
}

.desc {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--ink-2);
}

.action {
  margin-top: 20px;
}
</style>
