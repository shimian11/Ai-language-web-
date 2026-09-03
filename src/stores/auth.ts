import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { login as loginApi } from '@/api/auth'
import { clearToken, getToken, setToken } from '@/utils/auth'

import type { LoginParams } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken())

  const isLoggedIn = computed(() => token.value !== '')

  async function login(params: LoginParams): Promise<void> {
    const data = await loginApi(params)
    token.value = data
    setToken(data)
  }

  function logout(): void {
    token.value = ''
    clearToken()
  }

  return { token, isLoggedIn, login, logout }
})
