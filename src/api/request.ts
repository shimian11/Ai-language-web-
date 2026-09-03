import axios from 'axios'
import { ElMessage } from 'element-plus'

import router from '@/router'
import { clearToken, getToken } from '@/utils/auth'

import type { ApiResponse } from '@/types'

// 成功码约定待后端 API 文档对齐，暂按 0 处理
const SUCCESS_CODE = 0

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000,
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response): any => {
    const body = response.data as ApiResponse
    if (body.code === SUCCESS_CODE) {
      return body.data
    }
    if (body.code === 401) {
      clearToken()
      const current = router.currentRoute.value
      if (current.path.startsWith('/admin')) {
        router.push({ name: 'admin-login', query: { redirect: current.fullPath } })
      }
    }
    ElMessage.error(body.message || '请求失败')
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  (error) => {
    ElMessage.error(error.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  },
)

const http = {
  get<T = unknown>(url: string, params?: object): Promise<T> {
    return instance.get(url, { params }) as unknown as Promise<T>
  },
  post<T = unknown>(url: string, data?: object): Promise<T> {
    return instance.post(url, data) as unknown as Promise<T>
  },
  put<T = unknown>(url: string, data?: object): Promise<T> {
    return instance.put(url, data) as unknown as Promise<T>
  },
  delete<T = unknown>(url: string): Promise<T> {
    return instance.delete(url) as unknown as Promise<T>
  },
}

export default http
