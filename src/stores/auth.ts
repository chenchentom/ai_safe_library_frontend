import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo, type UserInfo } from '@/api/auth'
import type { MenuItem } from '@/types/menu'
import { collectMenuPaths } from '@/utils/menuIcon'
import { forceDismissOverlays } from '@/utils/cleanupOverlays'
import { useTagsStore } from '@/stores/tags'

function parseStoredUserInfo(): UserInfo | null {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserInfo
    return isValidUserInfo(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** 本地缓存的用户信息是否完整可用（空对象 {} 视为无效） */
export function isValidUserInfo(info: UserInfo | null | undefined): boolean {
  if (!info || typeof info !== 'object') return false
  if (!info.userId && !info.userName) return false
  if (info.superAdmin || info.roles?.includes('admin')) return true
  return Array.isArray(info.menus) && info.menus.length > 0
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(parseStoredUserInfo())

  const menus = computed(() => userInfo.value?.menus || [])
  const permissions = computed(() => userInfo.value?.permissions || [])
  const roles = computed(() => userInfo.value?.roles || [])
  const superAdmin = computed(() => !!userInfo.value?.superAdmin || roles.value.includes('admin'))
  const allowedPaths = computed(() => collectMenuPaths(menus.value))

  function clearSession() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    forceDismissOverlays()
    // 登出/重登后清空 keep-alive，避免详情抽屉遮罩等状态残留
    try {
      useTagsStore().closeAll()
    } catch {
      // Pinia 未就绪时忽略
    }
  }

  function hasValidSession() {
    return !!token.value && isValidUserInfo(userInfo.value)
  }

  async function ensureUserInfo() {
    if (isValidUserInfo(userInfo.value)) {
      return userInfo.value!
    }
    if (!token.value) {
      throw new Error('未登录')
    }
    await fetchUserInfo()
    return userInfo.value!
  }

  async function login(username: string, password: string) {
    clearSession()
    const res: any = await loginApi({ username, password })
    const tokenValue = res?.tokenValue || res?.token
    if (!tokenValue) {
      throw new Error('登录响应中未找到 token')
    }
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    await fetchUserInfo()
  }

  async function fetchUserInfo() {
    const res = await getUserInfo()
    if (!isValidUserInfo(res)) {
      throw new Error('用户信息不完整')
    }
    userInfo.value = res
    localStorage.setItem('userInfo', JSON.stringify(res))
  }

  function hasPermission(perm: string) {
    if (superAdmin.value) return true
    return permissions.value.includes(perm)
  }

  function canAccessPath(path: string) {
    if (superAdmin.value) return true
    if (!path || path === '/login' || path === '/403' || path === '/404') return true
    return allowedPaths.value.includes(path)
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      // ignore
    } finally {
      clearSession()
    }
  }

  const isLoggedIn = () => !!token.value && isValidUserInfo(userInfo.value)

  return {
    token,
    userInfo,
    menus,
    permissions,
    roles,
    superAdmin,
    allowedPaths,
    login,
    fetchUserInfo,
    ensureUserInfo,
    clearSession,
    hasValidSession,
    logout,
    isLoggedIn,
    hasPermission,
    canAccessPath,
  }
})
