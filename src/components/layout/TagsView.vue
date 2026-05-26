<template>
  <div class="tags-view" v-if="visitedViews.length > 0">
    <el-scrollbar>
      <div class="tags-wrapper">
        <span
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          class="tag-item"
          :class="{ active: isActive(tag) }"
          @click="goTo(tag)"
          @contextmenu.prevent="openContextMenu($event, tag)"
        >
          <el-icon v-if="tag.meta?.icon" class="tag-icon" :size="14">
            <component :is="tag.meta.icon" />
          </el-icon>
          <span>{{ tag.meta?.title || tag.name }}</span>
          <el-icon
            v-if="visitedViews.length > 1"
            class="tag-close"
            :size="12"
            @click.stop="closeTag(tag)"
          >
            <Close />
          </el-icon>
        </span>
      </div>
    </el-scrollbar>

    <!-- 右键菜单 -->
    <ul
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }"
    >
      <li @click="closeCurrent">关闭当前</li>
      <li @click="closeOthers">关闭其他</li>
      <li @click="closeAll">关闭全部</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { useTagsStore } from '@/stores/tags'

const route = useRoute()
const router = useRouter()
const tagsStore = useTagsStore()

const visitedViews = ref(tagsStore.visitedViews)
const contextMenuVisible = ref(false)
const contextMenuPos = reactive({ x: 0, y: 0 })
const selectedTag = ref<RouteLocationNormalized | null>(null)

watch(
  () => route.fullPath,
  () => {
    tagsStore.addView(route)
    visitedViews.value = tagsStore.visitedViews
  },
  { immediate: true }
)

function isActive(tag: RouteLocationNormalized) {
  return tag.fullPath === route.fullPath
}

function goTo(tag: RouteLocationNormalized) {
  router.push(tag.fullPath)
  contextMenuVisible.value = false
}

function closeTag(tag: RouteLocationNormalized) {
  tagsStore.removeView(tag)
  visitedViews.value = tagsStore.visitedViews
}

function openContextMenu(e: MouseEvent, tag: RouteLocationNormalized) {
  contextMenuPos.x = e.clientX
  contextMenuPos.y = e.clientY
  selectedTag.value = tag
  contextMenuVisible.value = true
}

function closeCurrent() {
  if (selectedTag.value) {
    tagsStore.removeView(selectedTag.value)
    visitedViews.value = tagsStore.visitedViews
  }
  contextMenuVisible.value = false
}

function closeOthers() {
  if (selectedTag.value) {
    tagsStore.closeOthers(selectedTag.value)
    visitedViews.value = tagsStore.visitedViews
  }
  contextMenuVisible.value = false
}

function closeAll() {
  tagsStore.closeAll()
  visitedViews.value = tagsStore.visitedViews
  contextMenuVisible.value = false
}

function hideContextMenu() {
  contextMenuVisible.value = false
}

onMounted(() => {
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style lang="scss" scoped>
.tags-view {
  height: 36px;
  background: rgba(8, 12, 20, 0.62);
  border-bottom: 1px solid rgba(90, 120, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(16px);
  flex-shrink: 0;
  position: relative;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  gap: 4px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  font-size: 12px;
  color: rgba(230, 237, 247, 0.62);
  border: 1px solid rgba(80, 120, 255, 0.12);
  background: rgba(11, 18, 32, 0.25);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: all 0.15s;

  &:hover {
    color: rgba(230, 237, 247, 0.86);
    background: rgba(80, 120, 255, 0.08);
    border-color: rgba(90, 120, 255, 0.28);
  }

  &.active {
    color: #fff;
    background: linear-gradient(
      90deg,
      rgba(79, 124, 255, 0.25),
      rgba(122, 92, 255, 0.18)
    );
    border-color: rgba(90, 120, 255, 0.25);
    box-shadow: 0 0 20px rgba(79, 124, 255, 0.18);

    .tag-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.tag-icon {
  color: inherit;
}

.tag-close {
  border-radius: 50%;
  padding: 1px;

  &:hover {
    background: rgba(80, 120, 255, 0.08);
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
  background: rgba(11, 18, 32, 0.9);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(80, 120, 255, 0.12);
  backdrop-filter: blur(16px);
  padding: 4px 0;
  margin: 0;
  list-style: none;
  min-width: 120px;

  li {
    padding: 8px 16px;
    font-size: 13px;
    color: rgba(230, 237, 247, 0.78);
    cursor: pointer;

    &:hover {
      background: rgba(80, 120, 255, 0.08);
      color: #ffffff;
    }
  }
}
</style>
