<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="onSubmit">
      <div class="brand">
        <img class="brand-img" :src="logoUrl" alt="提示词库" />
      </div>
      <h1>管理员登录</h1>
      <p class="sub">提示词库 · 管理后台</p>

      <label class="field">
        <span>用户名</span>
        <input
          v-model.trim="form.username"
          type="text"
          autocomplete="username"
          placeholder="请输入管理员账号"
          :disabled="loading"
        />
      </label>

      <label class="field">
        <span>密码</span>
        <div class="pwbox">
          <input
            v-model="form.password"
            :type="show ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="请输入密码"
            :disabled="loading"
            @keydown.enter="onSubmit"
          />
          <button
            type="button"
            class="eye"
            :aria-label="show ? '隐藏密码' : '显示密码'"
            @click="show = !show"
          >
            <svg v-if="show" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 12S4 5 12 5s11 7 11 7-3 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </label>

      <button class="submit" type="submit" :disabled="loading">
        {{ loading ? '登录中…' : '登 录' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import logoUrl from '@/assets/logo.jpg'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const show = ref(false)
const error = ref('')

async function onSubmit(): Promise<void> {
  error.value = ''
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  try {
    await auth.login({ username: form.username, password: form.password })
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect
      ? route.query.redirect
      : '/admin'
    router.push(redirect)
  } catch {
    // 具体错误已由请求拦截器 toast 提示，这里仅兜底
    error.value = '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
}

.login-card {
  position: relative;
  width: 360px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 36px 32px 30px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
}

.brand {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.brand-img {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: cover;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 4px;
}

.sub {
  text-align: center;
  font-size: 12.5px;
  color: var(--ink-2);
  margin: 0 0 24px;
}

.field {
  position: relative;
  display: block;
  margin-bottom: 16px;
}

.field > span {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
  margin-bottom: 6px;
}

.field input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg);
  color: var(--ink);
  font-size: 14px;
  outline: none;
  transition: 0.15s;
}

.pwbox {
  position: relative;
}

.pwbox input {
  padding-right: 42px;
}

/* 隐藏 Edge/Chromium 自带的密码 reveal 眼睛，避免与我方眼睛图标重叠成两个 */
.pwbox input::-ms-reveal {
  display: none;
}

.field input:focus {
  border-color: var(--accent);
}

.field .eye {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.field .eye:hover {
  color: var(--ink);
  background: rgba(0, 0, 0, 0.05);
}

.submit {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: var(--ink);
  color: var(--bg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;
}

.submit:hover {
  opacity: 0.9;
}

.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin: 14px 0 0;
  text-align: center;
  font-size: 12.5px;
  color: #e5484d;
}
</style>