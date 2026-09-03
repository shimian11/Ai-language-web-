<template>
  <div class="skeleton-grid">
    <div v-for="index in count" :key="index" class="skeleton-card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="image" class="sk-img" />
          <el-skeleton-item variant="text" class="sk-line w60" />
          <el-skeleton-item variant="text" class="sk-line" />
          <el-skeleton-item variant="text" class="sk-line short" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 8 })
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
