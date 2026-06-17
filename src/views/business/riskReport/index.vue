<template>
  <div class="risk-report-page">
    <el-tabs v-model="activeTab" class="dark-tabs">
      <el-tab-pane label="我的报送" name="my-reports">
        <RiskClueLibrary v-if="activeTab === 'my-reports'" ref="cluePanelRef" dept-scope embedded />
      </el-tab-pane>

      <el-tab-pane label="共享线索" name="shared-clues">
        <RiskClueLibrary v-if="activeTab === 'shared-clues'" shared-scope embedded />
      </el-tab-pane>

      <el-tab-pane label="批量上传" name="upload">
        <div class="upload-section">
          <div class="upload-card">
            <div class="upload-header">
              <h3>批量上传风险报告</h3>
              <el-button type="primary" plain size="small" @click="downloadTemplate">
                <el-icon><Download /></el-icon>
                <span>下载模板</span>
              </el-button>
            </div>

            <div class="upload-grid">
              <div class="upload-block">
                <div class="upload-block__label">Excel 数据文件（必填）</div>
                <el-upload
                  ref="excelUploadRef"
                  class="upload-area"
                  drag
                  :auto-upload="false"
                  :limit="1"
                  :disabled="uploading || previewing"
                  :on-change="handleExcelChange"
                  :on-remove="handleExcelRemove"
                  accept=".xlsx"
                >
                  <el-icon class="upload-icon" :size="40"><Upload /></el-icon>
                  <div class="upload-text">拖拽或点击选择 .xlsx</div>
                </el-upload>
              </div>

              <div class="upload-block">
                <div class="upload-block__label">报告 ZIP（可选，文件名须为 序号_名称.ext）</div>
                <el-upload
                  ref="zipUploadRef"
                  class="upload-area"
                  drag
                  :auto-upload="false"
                  :limit="1"
                  :disabled="uploading || previewing"
                  :on-change="handleZipChange"
                  :on-remove="handleZipRemove"
                  accept=".zip"
                >
                  <el-icon class="upload-icon" :size="40"><Upload /></el-icon>
                  <div class="upload-text">拖拽或点击选择 .zip</div>
                </el-upload>
              </div>
            </div>

            <div v-if="previewing || uploadProgress > 0" class="upload-progress">
              <div class="upload-progress__label">
                <span>{{ progressLabel }}</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <el-progress :percentage="uploadProgress" :stroke-width="10" :status="progressStatus" />
            </div>

            <div class="upload-actions">
              <el-button
                :loading="previewing"
                :disabled="!selectedExcel || uploading || previewing"
                @click="handlePreview"
              >
                校验匹配
              </el-button>
              <el-button
                type="primary"
                :loading="uploading"
                :disabled="!selectedExcel || uploading || previewing"
                @click="handleConfirmUpload"
              >
                <el-icon><Upload /></el-icon>
                <span>确认上传</span>
              </el-button>
            </div>

            <div v-if="matchPreview" class="match-preview">
              <div class="match-preview__summary">
                共 {{ matchPreview.excelRowCount }} 条线索<template v-if="selectedZip">，
                {{ matchPreview.matchedSerialCount }} 个序号已匹配报告，
                {{ matchPreview.missingReportSerials.length }} 个序号缺报告，
                {{ matchPreview.unmatchedFiles.length }} 个 ZIP 文件无法匹配</template><template v-else>（未上传报告 ZIP）</template>。
              </div>
              <div v-if="selectedZip && matchPreview.missingReportSerials.length" class="match-preview__warn">
                缺报告序号：{{ matchPreview.missingReportSerials.join('、') }}
              </div>
              <ul v-if="selectedZip && matchPreview.unmatchedFiles.length" class="match-preview__list">
                <li v-for="(item, idx) in matchPreview.unmatchedFiles" :key="idx">
                  {{ item.fileName }} — {{ item.reason }}
                </li>
              </ul>
            </div>

            <div v-if="uploadResult" class="upload-result">
              <div class="result-header">
                <el-icon :size="20" :color="uploadResult.failCount > 0 ? '#f59e0b' : '#10b981'">
                  <CircleCheckFilled v-if="uploadResult.failCount === 0" />
                  <WarningFilled v-else />
                </el-icon>
                <span>{{ uploadResult.status === 'success' ? '全部导入成功' : '导入完成' }}</span>
              </div>
              <div class="result-stats">
                <span>总计: {{ uploadResult.totalCount }}</span>
                <span class="result-success">成功: {{ uploadResult.successCount }}</span>
                <span class="result-fail">失败: {{ uploadResult.failCount }}</span>
              </div>
              <div v-if="uploadResult.errors.length > 0" class="result-errors">
                <div class="error-title">失败详情（前 20 条）:</div>
                <div v-for="(err, idx) in uploadResult.errors" :key="idx" class="error-item">
                  {{ err }}
                </div>
              </div>
              <div v-if="uploadResult.failCount > 0" class="result-actions">
                <el-button type="primary" link @click="activeTab = 'history'; historyPanelRef?.refresh?.()">
                  前往上传历史查看全部失败原因
                </el-button>
              </div>
            </div>

            <div class="format-info">
              <h4>Excel 格式要求（与模板一致）</h4>
              <ul>
                <li>第一行为表头，共 17 列：序号、事件名、内容、一级分类、二级分类、产品/组件/服务、运营主体、风险描述、来源url、来源网站、论文名称、研究团队、是否验证、是否报送、报送渠道、报送时间、报送人/分中心</li>
                <li>必填：事件名、一级分类、二级分类、风险描述；分类须在「风险线索标签」中存在且匹配</li>
                <li>是否验证/是否报送填「是」或「否」；报送时间支持 Excel 日期或 yyyy-MM-dd 格式</li>
                <li>单次上传最多 1000 条；可选 ZIP 报告包，文件命名：1_风险报告.pdf</li>
                <li>可选先点击「校验匹配」查看报告对应关系；仅 Excel 时也可直接「确认上传」</li>
              </ul>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="上传历史" name="history">
        <UploadHistoryPanel v-if="activeTab === 'history'" ref="historyPanelRef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { Download, Upload, CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'
import RiskClueLibrary from '@/views/business/riskClue/index.vue'
import UploadHistoryPanel from '@/views/business/riskReport/UploadHistoryPanel.vue'
import {
  confirmReportUpload,
  previewReportUpload,
  downloadReportTemplate,
  waitUploadComplete,
  getUploadBatchDetails,
  type UploadMatchPreview,
  type UploadResult,
} from '@/api/riskReport'

const activeTab = ref('my-reports')
const uploading = ref(false)
const previewing = ref(false)
const uploadProgress = ref(0)
const selectedExcel = ref<File | null>(null)
const selectedZip = ref<File | null>(null)
const matchPreview = ref<UploadMatchPreview | null>(null)
const uploadResult = ref<UploadResult | null>(null)
const excelUploadRef = ref<UploadInstance>()
const zipUploadRef = ref<UploadInstance>()
const cluePanelRef = ref<{ refresh?: () => void } | null>(null)
const historyPanelRef = ref<{ refresh?: () => void } | null>(null)
/** 本页已成功上传过的文件指纹，用于拦截误重复上传 */
const lastUploadedFileKey = ref<string | null>(null)
/** 最近一次校验对应的文件组合，用于判断预览是否仍有效 */
const previewFileKey = ref<string | null>(null)

const progressLabel = computed(() => {
  if (previewing.value) {
    return selectedZip.value ? '正在校验 Excel 与 ZIP 匹配…' : '正在校验 Excel…'
  }
  if (uploadProgress.value < 40) return '正在上传文件…'
  if (uploadProgress.value < 100) return '正在校验并入库…'
  return '处理完成'
})

function fileKey(excel: File, zip: File | null): string {
  const zipPart = zip ? `${zip.name}|${zip.size}|${zip.lastModified}` : 'no-zip'
  return `${excel.name}|${excel.size}|${excel.lastModified}|${zipPart}`
}

function invalidatePreview() {
  matchPreview.value = null
  previewFileKey.value = null
}

function handleExcelChange(file: UploadFile) {
  selectedExcel.value = file.raw || null
  invalidatePreview()
  uploadResult.value = null
  uploadProgress.value = 0
}

function handleExcelRemove() {
  selectedExcel.value = null
  invalidatePreview()
}

function handleZipChange(file: UploadFile) {
  selectedZip.value = file.raw || null
  invalidatePreview()
}

function handleZipRemove() {
  selectedZip.value = null
  invalidatePreview()
}

function buildConfirmMessage(preview: UploadMatchPreview): string {
  if (selectedZip.value) {
    return `共 ${preview.excelRowCount} 条线索，${preview.matchedSerialCount} 个序号已匹配报告。若无异议请点击确定开始导入。`
  }
  return `共 ${preview.excelRowCount} 条线索将导入（未上传报告 ZIP）。若无异议请点击确定开始导入。`
}

async function runPreview(showSuccessMessage = false): Promise<UploadMatchPreview | null> {
  if (!selectedExcel.value) {
    ElMessage.warning('请先选择 Excel 文件')
    return null
  }
  const currentFileKey = fileKey(selectedExcel.value, selectedZip.value)
  if (matchPreview.value?.previewToken && previewFileKey.value === currentFileKey) {
    return matchPreview.value
  }

  previewing.value = true
  uploadProgress.value = 0
  matchPreview.value = null
  try {
    const preview = await previewReportUpload(selectedExcel.value, selectedZip.value, (p) => {
      uploadProgress.value = p
    })
    matchPreview.value = preview
    previewFileKey.value = currentFileKey
    if (showSuccessMessage) {
      ElMessage.success('匹配校验完成，请确认后上传')
    }
    return preview
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '校验失败')
    return null
  } finally {
    previewing.value = false
  }
}

async function handlePreview() {
  await runPreview(true)
}

async function handleConfirmUpload() {
  if (!selectedExcel.value) {
    ElMessage.warning('请先选择 Excel 文件')
    return
  }

  const preview = await runPreview(false)
  if (!preview?.previewToken) {
    return
  }

  try {
    await ElMessageBox.confirm(
      buildConfirmMessage(preview),
      '确认上传',
      { type: 'warning', confirmButtonText: '确认上传', cancelButtonText: '取消' },
    )
  } catch {
    return
  }

  const currentFileKey = fileKey(selectedExcel.value, selectedZip.value)
  if (lastUploadedFileKey.value === currentFileKey) {
    try {
      await ElMessageBox.confirm(
        '该文件组合在本页已成功上传过，再次上传可能产生重复数据。确定要继续吗？',
        '重复上传确认',
        { type: 'warning', confirmButtonText: '继续上传', cancelButtonText: '取消' },
      )
    } catch {
      return
    }
  }

  uploading.value = true
  uploadResult.value = null
  uploadProgress.value = 0
  try {
    const start = await confirmReportUpload(preview.previewToken)
    uploadProgress.value = 40
    const batchId = start.batchId
    const finalProgress = await waitUploadComplete(batchId, (p) => {
      uploadProgress.value = p
    })

    let errors: string[] = []
    if (finalProgress.failCount > 0) {
      const detailRes = await getUploadBatchDetails(batchId, { page: 1, size: 20, status: 'fail' })
      errors = ((detailRes as { rows?: Array<{ errorMessage?: string }> })?.rows || [])
        .map((d) => d.errorMessage || '')
        .filter(Boolean)
    }

    uploadResult.value = {
      batchId,
      totalCount: finalProgress.totalCount,
      successCount: finalProgress.successCount,
      failCount: finalProgress.failCount,
      status: finalProgress.status,
      errors,
    }

    if (finalProgress.status === 'success') {
      ElMessage.success(`导入成功，共 ${finalProgress.successCount} 条`)
    } else if (finalProgress.status === 'partial_fail') {
      ElMessage.warning(`部分成功：成功 ${finalProgress.successCount} 条，失败 ${finalProgress.failCount} 条`)
    } else {
      ElMessage.error(finalProgress.errorSummary || '导入失败')
    }

    if (finalProgress.successCount > 0) {
      lastUploadedFileKey.value = currentFileKey
      selectedExcel.value = null
      selectedZip.value = null
      invalidatePreview()
      excelUploadRef.value?.clearFiles()
      zipUploadRef.value?.clearFiles()
    }

    cluePanelRef.value?.refresh?.()
    historyPanelRef.value?.refresh?.()
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '上传失败')
    uploadProgress.value = 0
  } finally {
    uploading.value = false
  }
}

async function downloadTemplate() {
  try {
    await downloadReportTemplate()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '模板下载失败'
    ElMessage.error(msg)
  }
}

const progressStatus = computed(() => {
  if (uploading.value || previewing.value) return undefined
  if (uploadResult.value?.failCount) return 'warning'
  if (uploadResult.value) return 'success'
  return undefined
})
</script>

<style lang="scss" scoped>
.risk-report-page {
  background: #0f172a;
  padding: 16px;
  min-height: calc(100vh - #{$header-height});
}

.dark-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    color: #94a3b8;

    &.is-active {
      color: #60a5fa;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #3b82f6;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(59, 130, 246, 0.15);
  }
}

.upload-section {
  display: flex;
  justify-content: center;
}

.upload-card {
  width: 100%;
  max-width: 920px;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  padding: 24px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0;
  }
}

.upload-area {
  :deep(.el-upload-dragger) {
    background: rgba(15, 23, 42, 0.5);
    border: 2px dashed rgba(59, 130, 246, 0.3);
    border-radius: 10px;
    padding: 40px 20px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #3b82f6;
    }
  }

  .upload-icon {
    color: #64748b;
    margin-bottom: 12px;
  }

  .upload-text {
    color: #94a3b8;
    font-size: 14px;

    em {
      color: #60a5fa;
      font-style: normal;
    }
  }

  .upload-tip {
    color: #64748b;
    font-size: 12px;
    margin-top: 8px;
  }
}

.upload-progress {
  margin-top: 20px;

  &__label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    color: #94a3b8;
  }
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.upload-block__label {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.match-preview {
  margin-top: 16px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(251, 191, 36, 0.25);
  color: #cbd5e1;
  font-size: 13px;
}

.match-preview__summary {
  line-height: 1.6;
}

.match-preview__warn {
  margin-top: 8px;
  color: #fbbf24;
}

.match-preview__list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.upload-reset-hint {
  margin: 12px 0 0;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.upload-result {
  margin-top: 20px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.1);

  .result-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 12px;
  }

  .result-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 12px;
    color: #94a3b8;
    font-size: 14px;
  }

  .result-success {
    color: #34d399;
    font-weight: 500;
  }

  .result-fail {
    color: #fbbf24;
    font-weight: 500;
  }

  .result-errors {
    margin-top: 8px;
  }

  .result-actions {
    margin-top: 10px;
  }

  .error-title {
    color: #f87171;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .error-item {
    font-size: 13px;
    color: #94a3b8;
    padding: 4px 0;
    border-bottom: 1px solid rgba(59, 130, 246, 0.05);

    &:last-child {
      border-bottom: none;
    }
  }
}

.format-info {
  margin-top: 24px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.08);

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #94a3b8;
    margin: 0 0 10px 0;
  }

  ul {
    padding-left: 20px;
    margin: 0;
  }

  li {
    font-size: 13px;
    color: #64748b;
    line-height: 1.8;
  }
}
</style>
