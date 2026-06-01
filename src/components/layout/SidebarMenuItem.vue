<template>
  <template v-if="menu.menuType === 'M' && menu.children?.length">
    <el-sub-menu :index="`menu-${menu.menuId}`">
      <template #title>
        <el-icon><component :is="resolveMenuIcon(menu.icon)" /></el-icon>
        <span>{{ menu.menuName }}</span>
      </template>
      <SidebarMenuItem v-for="child in menu.children" :key="child.menuId" :menu="child" />
    </el-sub-menu>
  </template>
  <el-menu-item v-else-if="menu.path" :index="menu.path">
    <el-icon><component :is="resolveMenuIcon(menu.icon)" /></el-icon>
    <template #title>{{ menu.menuName }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/menu'
import { resolveMenuIcon } from '@/utils/menuIcon'
import SidebarMenuItem from './SidebarMenuItem.vue'

defineProps<{
  menu: MenuItem
}>()

</script>
