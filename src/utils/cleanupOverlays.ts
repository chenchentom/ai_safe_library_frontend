import { ElMessageBox } from 'element-plus'

/** 弹层是否处于展示态（含进入动画中 opacity=0 的阶段） */
function isElementVisible(el: Element) {
  const style = window.getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

function isOpenDialogOverlay(overlay: Element) {
  if (overlay.classList.contains('el-modal-dialog') && isElementVisible(overlay)) {
    return true
  }

  const overlayDialog = overlay.querySelector('.el-overlay-dialog[role="dialog"]')
  if (overlayDialog && isElementVisible(overlay) && isElementVisible(overlayDialog)) {
    return true
  }

  const dialog = overlay.querySelector('.el-dialog')
  if (!dialog || dialog.getAttribute('aria-hidden') === 'true') {
    return false
  }
  const wrapper = dialog.closest('.el-overlay-dialog') ?? dialog.parentElement
  return !!wrapper && isElementVisible(overlay) && isElementVisible(wrapper)
}

function isOpenDrawerOverlay(overlay: Element) {
  const drawer = overlay.querySelector('.el-drawer')
  if (!drawer || drawer.getAttribute('aria-hidden') === 'true') {
    return false
  }
  return isElementVisible(overlay) && isElementVisible(drawer)
}

function overlayShouldKeep(overlay: Element) {
  if (!isElementVisible(overlay)) {
    return false
  }

  if (overlay.classList.contains('is-message-box')) {
    const box = overlay.querySelector('.el-message-box')
    return !!box && isElementVisible(box)
  }

  if (isOpenDialogOverlay(overlay) || isOpenDrawerOverlay(overlay)) {
    return true
  }

  return false
}

function removeStaleOverlays(root: ParentNode = document) {
  root.querySelectorAll('.el-overlay').forEach((overlay) => {
    if (!overlayShouldKeep(overlay)) {
      overlay.remove()
    }
  })
}

function removeStaleLoadingMasks(root: ParentNode = document) {
  root.querySelectorAll('.el-loading-mask').forEach((mask) => {
    mask.remove()
  })
  root.querySelectorAll('.el-loading-parent--hidden').forEach((el) => {
    el.classList.remove('el-loading-parent--hidden')
  })
}

/**
 * 清理 Element Plus 残留在 body 上的遮罩/弹层，避免挡住登录页等无法点击。
 * 不会移除正在展示中的 Dialog / Drawer / MessageBox。
 */
export function forceDismissOverlays() {
  try {
    ElMessageBox.close()
  } catch {
    // ignore
  }

  document.body.classList.remove('el-popup-parent--hidden')
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')

  removeStaleOverlays(document.body)
  const appRoot = document.getElementById('app')
  if (appRoot) {
    removeStaleOverlays(appRoot)
    removeStaleLoadingMasks(appRoot)
  }
  removeStaleLoadingMasks(document.body)
}

/** 路由切换后清一次残留遮罩（不延迟反复清理，避免误删刚打开的 Dialog） */
export function scheduleDismissOverlays() {
  forceDismissOverlays()
  requestAnimationFrame(() => {
    forceDismissOverlays()
  })
}

/** @deprecated 使用 forceDismissOverlays */
export function cleanupPopperLock() {
  forceDismissOverlays()
}

/** 页面失活/卸载时重置 loading，避免 v-loading 遮罩残留 */
export function resetPageLoading(loading: { value: boolean }) {
  loading.value = false
}

/** 业务页（抽屉/筛选弹层）离开或失活时统一复位 */
export function resetBusinessPageShell(state: {
  loading?: { value: boolean }
  drawerVisible?: { value: boolean }
  filterPopoverVisible?: { value: boolean }
  dialogVisible?: { value: boolean }
}) {
  if (state.loading) {
    state.loading.value = false
  }
  if (state.drawerVisible) {
    state.drawerVisible.value = false
  }
  if (state.filterPopoverVisible) {
    state.filterPopoverVisible.value = false
  }
  if (state.dialogVisible) {
    state.dialogVisible.value = false
  }
  forceDismissOverlays()
}

/** 可靠打开 Dialog（避免 v-model 已为 true 时点击「新增」无反应） */
export function openDialogVisible(dialogVisible: { value: boolean }) {
  dialogVisible.value = false
  queueMicrotask(() => {
    dialogVisible.value = true
  })
}
