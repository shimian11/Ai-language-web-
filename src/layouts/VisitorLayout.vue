<template>
  <!-- 访客端外壳：纸感顶栏 + 页面出口 + 页脚 -->
  <div class="visitor-page">
    <header class="topbar">
      <div class="topbar-in">
        <!-- 品牌区：只用昵称，不出现真实姓名 -->
        <RouterLink class="brand" to="/">
          <b>斑马QAQ</b>
          <span>Personal Blog</span>
        </RouterLink>
        <!-- 主导航：四个内容面 -->
        <nav class="nav">
          <RouterLink to="/" :class="{ on: isActive('home') }">首页</RouterLink>
          <RouterLink to="/prompts" :class="{ on: isActive('prompts') || isActive('prompt-detail') }">
            提示词
          </RouterLink>
          <RouterLink to="/notes" :class="{ on: isActive('notes') || isActive('article-note') }">
            心得
          </RouterLink>
          <RouterLink
            to="/internship"
            :class="{ on: isActive('internship') || isActive('article-internship') }"
          >
            实习
          </RouterLink>
          <RouterLink
            to="/interview"
            :class="{ on: isActive('interview') || isActive('article-interview') }"
          >
            面试
          </RouterLink>
        </nav>
        <!-- 右侧：收藏与 GitHub -->
        <div class="right">
          <RouterLink class="pill ghost" to="/favorites">收藏</RouterLink>
          <a
            class="pill gh"
            href="https://github.com/"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>

    <router-view />

    <footer class="v-footer">
      <div class="container-v foot-in">
        <span>© 2026 斑马QAQ · 个人博客</span>
        <a href="https://github.com/" target="_blank" rel="noopener">GITHUB ↗</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

/** 判断当前路由是否命中指定路由名（导航高亮用） */
function isActive(name: string): boolean {
  return route.name === name
}
</script>

<style scoped>
/* 顶栏：纸感 + 毛玻璃 */
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--paper) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}

.topbar-in {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 26px;
}

/* 品牌：昵称 + 英文标注 */
.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
  text-decoration: none;
  color: var(--ink);
}
.brand b {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.brand span {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.18em;
  color: var(--ink-3);
  text-transform: uppercase;
}

/* 主导航 */
.nav {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-left: 8px;
}
.nav a {
  color: var(--ink-2);
  font-size: 13px;
  letter-spacing: 0.05em;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 1px solid transparent;
  transition: color 0.25s, border-color 0.25s;
}
.nav a:hover,
.nav a.on {
  color: var(--ink);
  border-color: var(--red);
}

/* 右侧动作区 */
.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 12.5px;
  text-decoration: none;
  color: var(--ink-2);
  transition: 0.2s;
  white-space: nowrap;
}
.pill:hover {
  color: var(--ink);
  border-color: var(--ink-3);
  transform: translateY(-1px);
}
.pill.ghost.on,
.pill.ghost.router-link-active {
  color: var(--ink);
  border-color: var(--ink-3);
}
.pill.gh::after {
  content: '↗';
  color: var(--red);
}

/* 页脚 */
.foot-in {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

@media (max-width: 860px) {
  .nav {
    display: none;
  }
  .topbar-in {
    padding: 0 18px;
  }
}
</style>
