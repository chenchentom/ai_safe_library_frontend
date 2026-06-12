<template>
  <div class="error-page">
    <h1>403</h1>
    <p>权限不足或登录状态已失效</p>
    <div class="error-actions">
      <el-button type="primary" @click="goLogin">重新登录</el-button>
      <el-button @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { forceDismissOverlays } from '@/utils/cleanupOverlays'

const router = useRouter()
const authStore = useAuthStore()

function goLogin() {
  authStore.clearSession()
  forceDismissOverlays()
  router.replace('/login')
}

async function goHome() {
  forceDismissOverlays()
  if (authStore.hasValidSession() && authStore.canAccessPath('/dashboard')) {
    router.replace('/dashboard')
    return
  }
  goLogin()
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  h1 {
    font-size: 72px;
    color: var(--color-text-secondary);
  }
  p {
    font-size: var(--font-size-lg);
    color: var(--color-text-secondary);
    margin: 16px 0 24px;
  }
}

.error-actions {
  display: flex;
  gap: 12px;
}
</style>
