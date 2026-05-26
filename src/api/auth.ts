import { post, get } from './index'
import type { AxiosResponse } from 'axios'

export interface LoginParams {
  username: string
  password: string
  code?: string
  uuid?: string
}

export interface LoginResult {
  token: string
}

export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

// 登录
export function login(data: LoginParams) {
  return post<LoginResult>('/auth/login', data as unknown as Record<string, unknown>)
}

// 获取当前用户信息
export function getUserInfo() {
  return get<UserInfo>('/auth/info')
}

// 登出
export function logout() {
  return post('/auth/logout')
}

// 获取验证码
export function getCaptcha() {
  return get<{ img: string; uuid: string }>('/auth/captcha')
}
