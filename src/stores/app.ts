import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // state
  const sidebarCollapsed = ref(false)
  const device = ref<'desktop' | 'mobile'>('desktop')

  // actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
  }

  function setDevice(d: 'desktop' | 'mobile') {
    device.value = d
    if (d === 'mobile') {
      sidebarCollapsed.value = true
    }
  }

  return {
    sidebarCollapsed,
    device,
    toggleSidebar,
    setSidebarCollapsed,
    setDevice,
  }
})
