<template>
  <div class="skeleton-grid" :class="{ 'as-list': variant === 'list' }">
    <div v-for="index in count" :key="index" class="skeleton-card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item v-if="variant !== 'list'" variant="image" class="sk-img" />
          <el-skeleton-item variant="text" class="sk-line w60" />
          <el-skeleton-item variant="text" class="sk-line" />
          <el-skeleton-item variant="text" class="sk-line short" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number; variant?: 'grid' | 'list' }>(), {
  count: 8,
  variant: 'grid',
})
</script>

<style scoped>
.skeleton-grid {
  column-count: 4;
  column-gap: 20px;
}

@media (max-width: 1100px) {
  .skeleton-grid {
    column-count: 3;
  }
}

@media (max-width: 780px) {
  .skeleton-grid {
    column-count: 2;
  }
}

.skeleton-card {
  break-inside: avoid;
  margin-bottom: 20px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px;
  display: inline-block;
  width: 100%;
}

/* 列表型页面（心得/面试/实习）用单列骨架，与真实列表同宽同节奏 */
.skeleton-grid.as-list {
  column-count: 1;
}

.as-list .skeleton-card {
  padding: 22px 18px;
  border-radius: 12px;
}

.sk-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
}

.sk-line {
  margin-top: 12px;
  width: 100%;
}

.sk-line.w60 {
  width: 60%;
}

.sk-line.short {
  width: 40%;
}
</style>
