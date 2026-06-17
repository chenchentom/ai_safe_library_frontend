<template>
  <section v-if="attachments.length > 0 || loading" class="detail-block">
    <header class="detail-block__header">
      <h4 class="section-title">
        <span class="section-title__icon"><el-icon><Document /></el-icon></span>
        报告附件
      </h4>
      <span class="detail-block__count">{{ attachments.length }} 个文件</span>
    </header>
    <ul v-loading="loading" class="report-attachment-list">
      <li v-for="item in attachments" :key="item.id" class="report-attachment-list__item">
        <button type="button" class="report-attachment-list__name" @click="openPreview(item)">
          {{ item.fileName }}
        </button>
        <div class="report-attachment-list__actions">
          <el-button link type="primary" @click="openPreview(item)">预览</el-button>
          <el-button link @click="handleDownload(item)">下载</el-button>
          <el-button v-if="deletable" link type="danger" @click="handleDelete(item)">删除</el-button>
        </div>
      </li>
    </ul>

    <ReportPreviewDialog
      v-model:visible="previewVisible"
      :attachment-id="previewTarget?.id ?? ''"
      :file-name="previewTarget?.fileName ?? ''"
      :content-type="previewTarget?.contentType"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import ReportPreviewDialog from '@/components/business/ReportPreviewDialog.vue'
import {
  deleteClueAttachment,
  downloadClueAttachment,
  listClueAttachments,
  normalizeAttachmentId,
  normalizeAttachmentName,
  type ClueAttachment,
  type ReportAttachmentMeta,
} from '@/api/clueAttachment'

const props = defineProps<{
  clueId?: string
  /** ES 快照，打开详情时可先展示 */
  initialAttachments?: ReportAttachmentMeta[]
  /** 是否允许删除附件 */
  deletable?: boolean
}>()

const loading = ref(false)
const attachments = ref<ClueAttachment[]>([])
const previewVisible = ref(false)
const previewTarget = ref<ClueAttachment | null>(null)

watch(
  () => props.clueId,
  async (id) => {
    if (!id) {
      attachments.value = []
      return
    }
    loading.value = true
    try {
      const rows = await listClueAttachments(id)
      attachments.value = rows || []
    } catch {
      attachments.value = mapInitial(props.initialAttachments)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function mapInitial(items?: ReportAttachmentMeta[]): ClueAttachment[] {
  if (!items?.length) return []
  return items.map((item) => ({
    id: normalizeAttachmentId(item),
    fileName: normalizeAttachmentName(item),
    contentType: item.content_type || item.contentType,
    size: item.size,
  }))
}

function openPreview(item: ClueAttachment) {
  previewTarget.value = item
  previewVisible.value = true
}

async function handleDownload(item: ClueAttachment) {
  await downloadClueAttachment(item.id, item.fileName)
}

async function handleDelete(item: ClueAttachment) {
  try {
    await ElMessageBox.confirm(`确定删除报告「${item.fileName}」？`, '删除附件', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await deleteClueAttachment(item.id)
    attachments.value = attachments.value.filter((row) => row.id !== item.id)
    ElMessage.success('附件已删除')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.detail-block {
  margin-bottom: $spacing-5;
  padding: $spacing-4;
  border-radius: $border-radius-lg;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $color-border-light;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
    margin-bottom: $spacing-3;

    .section-title {
      margin: 0;
    }
  }

  &__count {
    font-size: 11px;
    font-family: $font-family-mono;
    color: $color-text-placeholder;
    letter-spacing: 0.04em;
  }
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: $font-family-display;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-3;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: $letter-spacing-wider;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: $border-radius-sm;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(160, 190, 255, 0.75);

    .el-icon {
      font-size: 13px;
    }
  }
}

.report-attachment-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-attachment-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: $border-radius-md;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid $color-border-light;
  transition:
    border-color $duration-base $ease-out,
    background $duration-base $ease-out;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: $color-border;
  }
}

.report-attachment-list__name {
  flex: 1;
  text-align: left;
  background: none;
  border: none;
  font-size: $font-size-sm;
  color: $color-text-regular;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color $duration-base $ease-out;

  &:hover {
    color: $color-primary-light;
  }

  &:focus-visible {
    outline: 2px solid $color-primary-300;
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.report-attachment-list__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  :deep(.el-button.is-link) {
    font-size: $font-size-xs;
    color: $color-text-secondary;

    &:hover {
      color: $color-text-primary;
    }
  }

  :deep(.el-button.is-link.el-button--primary) {
    color: $color-primary-light;

    &:hover {
      color: #8ba4ff;
    }
  }
}
</style>
