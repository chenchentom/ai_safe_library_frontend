<template>
  <div class="navbar">
    <div class="navbar-left">
      <span class="collapse-btn" @click="appStore.toggleSidebar()">
        <el-icon :size="20">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </span>

      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
          {{ item.meta?.title || item.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="navbar-right">
      <el-dropdown trigger="click">
        <div class="user-info">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="user-name">{{ authStore.userInfo?.nickName || '管理员' }}</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta?.title && !item.meta?.hidden)
})

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
    })
    await authStore.logout()
    router.push('/login')
  } catch {
    // cancelled
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  background: linear-gradient(180deg, rgba(10, 16, 28, 0.95), rgba(8, 12, 20, 0.92));
  border-bottom: 1px solid rgba(90, 120, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
  z-index: 10;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.collapse-btn {
  cursor: pointer;
  color: rgba(230, 237, 247, 0.8);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid rgba(80, 120, 255, 0.12);

  &:hover {
    background: rgba(80, 120, 255, 0.08);
    border-color: rgba(90, 120, 255, 0.28);
    box-shadow: 0 0 0 1px rgba(80, 120, 255, 0.18), 0 0 20px rgba(80, 120, 255, 0.12);
    color: #fff;
  }
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  border: 1px solid rgba(80, 120, 255, 0.12);
  background: rgba(11, 18, 32, 0.3);
  backdrop-filter: blur(16px);

  &:hover {
    background: rgba(80, 120, 255, 0.08);
    border-color: rgba(90, 120, 255, 0.28);
    box-shadow: 0 0 0 1px rgba(80, 120, 255, 0.18), 0 0 20px rgba(80, 120, 255, 0.12);
  }

  .user-name {
    font-size: var(--font-size-base);
    color: rgba(230, 237, 247, 0.86);
  }

  .arrow {
    font-size: 12px;
    color: rgba(230, 237, 247, 0.6);
  }
}

:deep(.el-breadcrumb__inner) {
  font-size: var(--font-size-base);
  color: rgba(230, 237, 247, 0.72);
}

:deep(.el-breadcrumb__separator) {
  color: rgba(230, 237, 247, 0.35);
}
</style>
