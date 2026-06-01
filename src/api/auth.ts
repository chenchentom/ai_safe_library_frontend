import { post, get } from './index'
import type { MenuItem } from '@/types/menu'

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
  deptId?: number
  deptName?: string
  roles: string[]
  permissions: string[]
  menus: MenuItem[]
  superAdmin?: boolean
}

export function login(data: LoginParams) {
  return post<LoginResult>('/auth/login', data as unknown as Record<string, unknown>)
}

export function getUserInfo() {
  return get<UserInfo>('/auth/info')
}

export function getAuthMenus() {
  return get<MenuItem[]>('/auth/menus')
}

export function logout() {
  return post('/auth/logout')
}

export function getCaptcha() {
  return get<{ img: string; uuid: string }>('/auth/captcha')
}
