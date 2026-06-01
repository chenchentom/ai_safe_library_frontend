import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo, type UserInfo } from '@/api/auth'
import type { MenuItem } from '@/types/menu'
import { collectMenuPaths } from '@/utils/menuIcon'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    (() => {
      try {
        const raw = localStorage.getItem('userInfo')
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })()
  )

  const menus = computed(() => userInfo.value?.menus || [])
  const permissions = computed(() => userInfo.value?.permissions || [])
  const roles = computed(() => userInfo.value?.roles || [])
  const superAdmin = computed(() => !!userInfo.value?.superAdmin || roles.value.includes('admin'))
  const allowedPaths = computed(() => collectMenuPaths(menus.value))

  async function login(username: string, password: string) {
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
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  const isLoggedIn = () => !!token.value

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
    logout,
    isLoggedIn,
    hasPermission,
    canAccessPath,
  }
})
