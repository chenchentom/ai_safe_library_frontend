<template>
  <div class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <img
        class="logo-image"
        src="@/assets/images/sidebar-logo.png"
        alt="AI安全事件库"
      />
      <span v-if="!appStore.sidebarCollapsed" class="logo-text">AI安全事件库</span>
    </div>

    <el-scrollbar>
      <el-menu
        v-if="authStore.menus.length"
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="rgba(230, 237, 247, 0.74)"
        active-text-color="#ffffff"
        popper-class="app-sidebar-menu-popper"
        popper-effect="dark"
        router
      >
        <SidebarMenuItem v-for="menu in authStore.menus" :key="menu.menuId" :menu="menu" />
      </el-menu>
      <div v-else class="sidebar-empty">
        <p>暂无菜单权限</p>
        <p class="hint">请联系管理员分配角色</p>
      </div>
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
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import SidebarMenuItem from './SidebarMenuItem.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
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
  gap: 10px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(90, 120, 255, 0.15);
  flex-shrink: 0;
  overflow: hidden;

  .logo-image {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
    filter: drop-shadow(0 0 10px rgba(79, 124, 255, 0.2));
  }

  .logo-text {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    letter-spacing: 0.06em;
  }
}

.sidebar.collapsed .sidebar-logo {
  padding: 0;

  .logo-text {
    display: none;
  }

  .logo-image {
    width: 28px;
    height: 28px;
  }
}

.sidebar-empty {
  padding: 24px 16px;
  text-align: center;
  color: rgba(230, 237, 247, 0.55);
  font-size: 13px;

  .hint {
    margin-top: 8px;
    font-size: 12px;
    opacity: 0.7;
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
