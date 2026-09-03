<template>
  <div class="visitor">
    <header class="topbar">
      <div class="topbar-in">
        <RouterLink class="logo" to="/">
          <span class="logo-mark">AI</span>
          网页设计<em>提示词库</em>
        </RouterLink>
        <div class="search">
          <input
            v-model="entryStore.keyword"
            type="text"
            placeholder="搜索提示词、案例、标签…"
            @keyup.enter="onSearch"
          />
        </div>
        <RouterLink class="pill" to="/favorites">我的收藏</RouterLink>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useEntryStore } from '@/stores/entry'

const router = useRouter()
const entryStore = useEntryStore()

// 前台无登录入口（管理后台经 /admin/login 书签直达）
// 关键词防抖 300ms 自动搜索；仅在首页时触发请求
let timer: number | undefined

watch(
  () => entryStore.keyword,
  () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(onSearch, 300)
  },
)

function onSearch(): void {
  window.clearTimeout(timer)
  entryStore.page = 1
  if (router.currentRoute.value.name !== 'home') {
    router.push({ name: 'home' })
  }
  entryStore.fetchEntries()
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(250, 249, 246, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.topbar-in {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.5px;
}

.logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--ink);
  color: var(--bg);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-family: var(--font-mono);
}

.logo em {
  font-style: normal;
  color: var(--accent);
}

.search {
  flex: 1;
  max-width: 420px;
  margin-left: auto;
}

.search input {
  width: 100%;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--card);
  padding: 0 16px 0 40px;
  font-size: 14px;
  color: var(--ink);
  outline: none;
  transition: border 0.15s;
}

.search input:focus {
  border-color: var(--ink);
}

.pill {
  height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--ink);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  transition: 0.15s;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.pill:hover {
  background: var(--ink);
  color: var(--bg);
}
</style>
