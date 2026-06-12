<template>
  <div class="login-page">
    <div class="visual-panel">
      <div class="brand-header">
        <img class="brand-logo-icon" src="@/assets/images/cncert-logo.png" alt="国家互联网应急中心" />
        <div class="brand-org">
          <span class="brand-org__name">国家互联网应急中心</span>
          <span class="brand-org__code">CNCERT</span>
        </div>
      </div>

      <div class="brand-core">
        <h1 class="brand-title">AI 安全事件库</h1>
        <p class="brand-subtitle">
          国家级网络大模型风控与安全事件基座。面向高强度对抗、注入风险、供应链潜在威胁，提供全网智能化安全态势监测、跨部门协同研判与全生命周期响应处置能力。
        </p>
      </div>

      <div class="brand-footer">
        <span>新技术安全一部 · 核心保密系统基座</span>
      </div>
    </div>

    <div class="login-panel">
      <div class="form-container">
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-desc">请使用您的内部安全凭证或工作网专线账户登录</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="username">内部邮箱 / 专线账户</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="name@cert.org.cn"
              autocomplete="off"
            />
          </div>

          <div class="input-group">
            <label for="password">安全密钥 / 动态口令</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
            />
          </div>

          <div class="form-actions">
            <label class="remember-me">
              <input v-model="rememberDevice" type="checkbox" />
              记住受信任设备
            </label>
            <a href="#" class="forgot-link" @click.prevent="handleRequestAccess">申请权限升级</a>
          </div>

          <button class="submit-btn" type="submit" :disabled="loading">
            {{ loading ? '登录中...' : '登 录 进 入' }}
          </button>
        </form>
      </div>

      <div class="global-footer">安全审计与追溯已全线启用 · 请严格遵守保密协议</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { forceDismissOverlays } from '@/utils/cleanupOverlays'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const rememberDevice = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

function handleRequestAccess() {
  ElMessage.info('请联系管理员申请权限升级')
}

onMounted(() => {
  forceDismissOverlays()
  // 清除损坏的登录态，避免有 token 却无菜单时被路由踢走导致“登录页点不了”
  if (localStorage.getItem('token') && !authStore.hasValidSession()) {
    authStore.clearSession()
  }
})

async function handleLogin() {
  if (loading.value) return
  if (!loginForm.username.trim()) {
    ElMessage.warning('请输入账号')
    return
  }
  if (!loginForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
  loading.value = true
  try {
    await authStore.login(loginForm.username.trim(), loginForm.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect as string | undefined
    if (redirect && authStore.canAccessPath(redirect)) {
      router.push(redirect)
    } else if (authStore.canAccessPath('/dashboard')) {
      router.push('/dashboard')
    } else if (authStore.allowedPaths.length) {
      router.push(authStore.allowedPaths[0])
    } else {
      router.push('/403')
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '登录失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.login-page {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #0d0f12;
  color: #ffffff;
  overflow: hidden;
}

.login-page * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

.visual-panel {
  flex: 6;
  position: relative;
  background: radial-gradient(circle at 30% 30%, #111a2e 0%, #070a0f 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px;
  overflow: hidden;
}

.visual-panel::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background-image: radial-gradient(rgba(0, 210, 255, 0.06) 1px, transparent 0),
    radial-gradient(rgba(0, 210, 255, 0.03) 2px, transparent 0);
  background-size: 40px 40px, 120px 120px;
  transform: rotate(-15deg);
  z-index: 1;
  pointer-events: none;
}

.visual-panel::after {
  content: '';
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 210, 255, 0.05) 0%, transparent 70%);
  filter: blur(60px);
  z-index: 2;
  pointer-events: none;
}

.brand-header {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo-icon {
  width: 42px;
  height: 42px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 0 12px rgba(79, 124, 255, 0.25));
}

.brand-org {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 16px 10px 14px;
  border-left: 2px solid rgba(79, 124, 255, 0.45);
  background: linear-gradient(90deg, rgba(79, 124, 255, 0.06) 0%, transparent 100%);
}

.brand-org__name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgba(230, 237, 247, 0.92);
  text-shadow: 0 0 20px rgba(79, 124, 255, 0.15);
}

.brand-org__code {
  font-family: $font-family-mono;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(147, 170, 255, 0.72);
}

.brand-core {
  position: relative;
  z-index: 3;
  max-width: 540px;
  margin-top: -40px;
}

.brand-title {
  font-size: 40px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 22px;
  background: linear-gradient(135deg, #ffffff 40%, #93c5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1.5px;
}

.brand-subtitle {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  letter-spacing: 0.5px;
}

.brand-footer {
  position: relative;
  z-index: 3;
  font-size: 13px;
  color: #334155;
  letter-spacing: 0.5px;
}

.login-panel {
  flex: 4;
  background-color: #07090b;
  border-left: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 80px;
  position: relative;
  z-index: 10;
}

.form-container {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 45px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.form-desc {
  font-size: 13px;
  color: #475569;
}

.input-group {
  position: relative;
  margin-bottom: 32px;
}

.input-group label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  letter-spacing: 1px;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  background: rgba(255, 255, 255, 0.01);
  border: none;
  border-bottom: 1px solid #1e293b;
  padding: 12px 4px;
  color: #ffffff;
  font-size: 15px;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-bottom-color: #00d2ff;
  background: rgba(0, 210, 255, 0.005);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
  margin-bottom: 38px;
  font-size: 13px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  cursor: pointer;
}

.remember-me input {
  accent-color: #00d2ff;
}

.forgot-link {
  color: #475569;
  text-decoration: none;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #00d2ff;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(90deg, #00d2ff 0%, #3b82f6 100%);
  border: none;
  padding: 14px;
  color: #07090b;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 210, 255, 0.12);
  letter-spacing: 2px;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 210, 255, 0.22);
}

.global-footer {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #1e293b;
  letter-spacing: 0.5px;
}
</style>
