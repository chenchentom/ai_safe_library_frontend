import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export const useTagsStore = defineStore('tags', () => {
  const visitedViews = ref<RouteLocationNormalized[]>([])
  const cachedViews = ref<string[]>([])

  function addView(view: RouteLocationNormalized) {
    if (view.meta?.hidden) return
    const exists = visitedViews.value.some((v) => v.fullPath === view.fullPath)
    if (!exists) {
      visitedViews.value.push({ ...view })
    }
    if (view.meta?.keepAlive && view.name && !cachedViews.value.includes(view.name as string)) {
      cachedViews.value.push(view.name as string)
    }
  }

  function removeView(view: RouteLocationNormalized) {
    const idx = visitedViews.value.findIndex((v) => v.fullPath === view.fullPath)
    if (idx === -1) return

    visitedViews.value.splice(idx, 1)

    // 同时从缓存中移除
    const cacheIdx = cachedViews.value.indexOf(view.name as string)
    if (cacheIdx !== -1) {
      cachedViews.value.splice(cacheIdx, 1)
    }
  }

  function closeOthers(view: RouteLocationNormalized) {
    visitedViews.value = visitedViews.value.filter(
      (v) => v.fullPath === view.fullPath || v.meta?.hidden
    )
    cachedViews.value = cachedViews.value.filter((name) =>
      visitedViews.value.some((v) => v.name === name)
    )
  }

  function closeAll() {
    visitedViews.value = visitedViews.value.filter((v) => v.meta?.hidden)
    cachedViews.value = []
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    removeView,
    closeOthers,
    closeAll,
  }
})
