<template>
  <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <span v-if="!appStore.sidebarCollapsed" class="logo-text">AI 安全平台</span>
      <span v-else class="logo-icon">
        <el-icon :size="22"><Monitor /></el-icon>
      </span>
    </div>

    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="rgba(230, 237, 247, 0.74)"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-menu-item index="/business/risk-clue">
          <el-icon><Warning /></el-icon>
          <template #title>风险线索库</template>
        </el-menu-item>

        <el-menu-item index="/business/security-event">
          <el-icon><Document /></el-icon>
          <template #title>安全事件库</template>
        </el-menu-item>

        <el-menu-item index="/business/risk-report">
          <el-icon><Upload /></el-icon>
          <template #title>风险报送</template>
        </el-menu-item>

        <el-sub-menu index="tag">
          <template #title>
            <el-icon><CollectionTag /></el-icon>
            <span>分类标签</span>
          </template>
          <el-menu-item index="/system/tag/risk-clue">
            <el-icon><Warning /></el-icon>
            <span>风险线索标签</span>
          </el-menu-item>
          <el-menu-item index="/system/tag/malicious-skill">
            <el-icon><CircleCloseFilled /></el-icon>
            <span>恶意Skill标签</span>
          </el-menu-item>
          <el-menu-item index="/system/tag/supply-chain-v2">
            <el-icon><Link /></el-icon>
            <span>供应链标签1.0</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/dept">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>

    <div class="sidebar-toggle" @click="appStore.toggleSidebar()">
      <el-icon :size="16">
        <DArrowLeft v-if="!appStore.sidebarCollapsed" />
        <DArrowRight v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

const activeMenu = computed(() => {
  const { path } = route
  if (path.startsWith('/system/')) return path
  if (path.startsWith('/system')) return '/system/user'
  if (path.startsWith('/business/')) return path
  if (path.startsWith('/business')) return '/business/risk-clue'
  return path
})
</script>

<style lang="scss" scoped>
.sidebar {
  width: $sidebar-width;
  height: 100vh;
  background: linear-gradient(180deg, #08111f 0%, #0b1730 100%);
  border-right: 1px solid rgba(80, 120, 255, 0.12);
  box-shadow: inset -1px 0 0 rgba(90, 120, 255, 0.08), 0 0 40px rgba(56, 110, 255, 0.06);
  display: flex;
  flex-direction: column;
  transition: width $transition-base;
  flex-shrink: 0;

  &.collapsed {
    width: $sidebar-collapsed-width;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      margin: 4px 8px;
    }
  }
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(90, 120, 255, 0.15);
  flex-shrink: 0;

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 1px;
  }

  .logo-icon {
    color: $color-primary;
  }
}

:deep(.el-menu) {
  border-right: none;
  flex: 1;
  background: transparent !important;
  padding: 10px 0;

  .el-sub-menu .el-menu {
    background-color: transparent !important;
  }

  .el-menu-item:hover,
  .el-sub-menu__title:hover {
    background-color: rgba(80, 120, 255, 0.08) !important;
  }

  .el-menu-item.is-active {
    background: linear-gradient(
        90deg,
        rgba(79, 124, 255, 0.25),
        rgba(122, 92, 255, 0.18)
      ) !important;
    border: 1px solid rgba(90, 120, 255, 0.25);
    box-shadow: 0 0 20px rgba(79, 124, 255, 0.18);
    color: #ffffff !important;
  }

  .el-menu-item,
  .el-sub-menu__title {
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
    margin: 4px 12px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(230, 237, 247, 0.72) !important;
  }

  .el-menu-item {
    border: 1px solid transparent;
  }

  .el-menu-item:hover,
  .el-sub-menu__title:hover {
    border-color: rgba(90, 120, 255, 0.18);
  }

  .el-menu-item.is-active {
    margin: 4px 12px;
  }

  .el-menu-item .el-icon,
  .el-sub-menu__title .el-icon {
    color: rgba(230, 237, 247, 0.62);
  }

  .el-menu-item.is-active .el-icon {
    color: rgba(230, 237, 247, 0.9);
  }
}

:deep(.el-scrollbar) {
  flex: 1;
}

.sidebar-toggle {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(80, 120, 255, 0.12);
  cursor: pointer;
  color: rgba(230, 237, 247, 0.62);
  flex-shrink: 0;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(80, 120, 255, 0.08);
    color: #ffffff;
  }
}
</style>
