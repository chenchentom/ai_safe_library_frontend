<template>
  <div class="app-layout" :class="{ collapsed: appStore.sidebarCollapsed }">
    <Sidebar />
    <div class="main-container">
      <Navbar />
      <TagsView />
      <div class="app-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="tagsStore.cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useTagsStore } from '@/stores/tags'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
import TagsView from './TagsView.vue'

const appStore = useAppStore()
const tagsStore = useTagsStore()
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #08101d 0%, #050b14 100%);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
  transition: margin-left var(--transition-base);
}

.app-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  background: transparent;
}
</style>
