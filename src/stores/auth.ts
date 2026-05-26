import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo, type UserInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // state
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

  // actions
  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    console.log('[auth store] 登录响应 (已由拦截器处理):', res)
    
    // 现在响应拦截器直接返回了 res.data，所以 SaTokenInfo 就是 res 本身
    const tokenValue = res?.tokenValue || res?.token
    console.log('[auth store] 提取到的 token:', tokenValue)
    
    if (!tokenValue) {
      throw new Error('登录响应中未找到 token')
    }
    
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    console.log('[auth store] Token 已保存到 localStorage')
    
    // 登录成功后获取用户信息
    await fetchUserInfo()
  }

  async function fetchUserInfo() {
    try {
      console.log('[auth store] 开始获取用户信息...')
      console.log('[auth store] 当前 token:', token.value)
      const res = await getUserInfo()
      console.log('[auth store] 获取用户信息成功 (已由拦截器处理):', res)
      // 现在响应拦截器直接返回了 res.data，所以用户信息就是 res 本身
      userInfo.value = res
      localStorage.setItem('userInfo', JSON.stringify(res))
    } catch (error) {
      console.error('[auth store] 获取用户信息失败:', error)
      // 获取用户信息失败，清除 token
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      throw new Error('获取用户信息失败')
    }
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

  // getters
  const isLoggedIn = () => !!token.value
  const roles = () => userInfo.value?.roles || []
  const permissions = () => userInfo.value?.permissions || []

  return {
    token,
    userInfo,
    login,
    fetchUserInfo,
    logout,
    isLoggedIn,
    roles,
    permissions,
  }
})
