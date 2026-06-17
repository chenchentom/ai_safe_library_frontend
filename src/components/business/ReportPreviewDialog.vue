<template>
  <el-dialog
    v-model="visibleModel"
    :title="fileName"
    width="860px"
    class="report-preview-dialog"
    append-to-body
    destroy-on-close
    align-center
    @closed="revokeBlob"
  >
    <div v-loading="loading" class="report-preview-dialog__body">
      <iframe
        v-if="previewKind === 'pdf' && blobUrl"
        :src="blobUrl"
        class="report-preview-dialog__iframe"
        title="PDF 预览"
      />
      <img
        v-else-if="previewKind === 'image' && blobUrl"
        :src="blobUrl"
        :alt="fileName"
        class="report-preview-dialog__image"
      />
      <VueOfficeDocx
        v-else-if="previewKind === 'docx' && docxArrayBuffer"
        :src="docxArrayBuffer"
        class="report-preview-dialog__docx"
      />
      <div v-else-if="!loading" class="report-preview-dialog__fallback">
        <el-icon :size="40"><Document /></el-icon>
        <p>该格式暂不支持在线预览，请下载后查看。</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="visibleModel = false">关闭</el-button>
      <el-button type="primary" :loading="downloading" @click="handleDownload">下载</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import {
  downloadClueAttachment,
  fetchAttachmentBlob,
  isDocxAttachment,
  isImageAttachment,
  isPdfAttachment,
} from '@/api/clueAttachment'

const props = defineProps<{
  visible: boolean
  attachmentId: number | string
  fileName: string
  contentType?: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const visibleModel = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const loading = ref(false)
const downloading = ref(false)
const blobUrl = ref('')
const docxArrayBuffer = ref<ArrayBuffer | null>(null)
const previewKind = ref<'pdf' | 'image' | 'docx' | 'other'>('other')

watch(
  () => [props.visible, props.attachmentId] as const,
  async ([open, id]) => {
    revokeBlob()
    if (!open || !id) return
    loading.value = true
    try {
      const blob = await fetchAttachmentBlob(id, 'preview')
      if (isPdfAttachment(props.fileName, props.contentType)) {
        previewKind.value = 'pdf'
        blobUrl.value = URL.createObjectURL(blob)
      } else if (isImageAttachment(props.fileName, props.contentType)) {
        previewKind.value = 'image'
        blobUrl.value = URL.createObjectURL(blob)
      } else if (isDocxAttachment(props.fileName, props.contentType)) {
        previewKind.value = 'docx'
        docxArrayBuffer.value = await blob.arrayBuffer()
      } else {
        previewKind.value = 'other'
      }
    } finally {
      loading.value = false
    }
  },
)

function revokeBlob() {
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
    blobUrl.value = ''
  }
  docxArrayBuffer.value = null
  previewKind.value = 'other'
}

async function handleDownload() {
  downloading.value = true
  try {
    await downloadClueAttachment(props.attachmentId, props.fileName)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped lang="scss">
.report-preview-dialog__body {
  min-height: 420px;
}

.report-preview-dialog__iframe {
  width: 100%;
  height: 70vh;
  border: none;
  border-radius: 8px;
  background: #fff;
}

.report-preview-dialog__image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
}

.report-preview-dialog__docx {
  max-height: 70vh;
  overflow: auto;
}

.report-preview-dialog__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 280px;
  color: rgba(230, 237, 247, 0.72);
}
</style>
