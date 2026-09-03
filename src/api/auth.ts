import http from './request'

export interface LoginParams {
  username: string
  password: string
}

export function login(params: LoginParams): Promise<string> {
  return http.post<string>('/auth/login', params)
}
