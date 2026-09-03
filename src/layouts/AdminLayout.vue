<template>
  <div class="admin">
    <aside class="side">
      <div class="side-logo">
        <span class="mark">AI</span>
        <div>
          <b>提示词库</b>
          <span>管理后台</span>
        </div>
      </div>
      <nav>
        <RouterLink
          class="side-item"
          :class="{ on: route.name === 'admin-dashboard' }"
          to="/admin"
        >
          ▦ 仪表盘
        </RouterLink>
        <RouterLink
          class="side-item"
          :class="{ on: String(route.name ?? '').startsWith('admin-entry') }"
          to="/admin/entries"
        >
          ▤ 案例管理
        </RouterLink>
        <RouterLink
          class="side-item"
          :class="{ on: route.name === 'admin-categories' }"
          to="/admin/categories"
        >
          ▣ 分类管理
        </RouterLink>
        <div class="side-divider"></div>
        <RouterLink class="side-item" to="/">↗ 返回前台</RouterLink>
        <RouterLink class="side-item" to="/favorites">★ 我的收藏</RouterLink>
      </nav>
      <div class="side-foot">
        管理员已登录<br />
        <a href="#" @click.prevent="onLogout">退出登录 →</a>
      </div>
    </aside>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function onLogout(): void {
  auth.logout()
  router.push({ name: 'admin-login' })
}
</script>

<style scoped>
.side {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 224px;
  background: #16130f;
  display: flex;
  flex-direction: column;
  z-index: 40;
}

.side-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.side-logo .mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  flex-shrink: 0;
}

.side-logo b {
  display: block;
  color: #f0ede6;
  font-size: 14.5px;
  line-height: 1.3;
}

.side-logo span {
  display: block;
  color: #8a8275;
  font-size: 11px;
  letter-spacing: 1px;
}

nav {
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 14px;
  color: var(--side-ink, #a8a08f);
  transition: 0.15s;
}

.side-item:hover {
  color: #edeae2;
  background: rgba(255, 255, 255, 0.06);
}

.side-item.on {
  color: #ffa36b;
  background: rgba(232, 89, 12, 0.16);
  font-weight: 600;
}

.side-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 10px 8px;
}

.side-foot {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11.5px;
  color: #8a8275;
  line-height: 1.7;
}

.side-foot a {
  color: #ffa36b;
}

.main {
  margin-left: 224px;
  min-height: 100vh;
}

@media (max-width: 900px) {
  .side {
    width: 64px;
  }
  .side-logo div,
  .side-item span,
  .side-foot {
    display: none;
  }
  .side-item {
    justify-content: center;
    padding: 12px 0;
  }
  .main {
    margin-left: 64px;
  }
}
</style>
