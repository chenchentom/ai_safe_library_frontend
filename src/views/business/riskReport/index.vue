<template>
  <div class="risk-report-page">
    <el-tabs v-model="activeTab" class="dark-tabs">
      <!-- Tab 1: My Reports -->
      <el-tab-pane label="我的报送" name="my-reports">
        <div class="table-wrap">
          <el-table
            v-loading="loading"
            :data="reportList"
            style="width: 100%"
            row-key="id"
            @row-click="openDetail"
          >
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="riskTagType(row.riskLevel)" size="small" effect="dark">
                  {{ riskLabel(row.riskLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reviewStatus" label="审核状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="reviewTagType(row.reviewStatus)" size="small">
                  {{ reviewLabel(row.reviewStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="170" />
          </el-table>

          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="fetchReports"
              @current-change="fetchReports"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Batch Upload -->
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

            <el-upload
              ref="uploadRef"
              class="upload-area"
              drag
              :auto-upload="false"
              :limit="1"
              :on-exceed="handleExceed"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              accept=".xlsx,.xls,.csv"
            >
              <el-icon class="upload-icon" :size="48"><Upload /></el-icon>
              <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="upload-tip">仅支持 .xlsx / .xls / .csv 文件</div>
            </el-upload>

            <div class="upload-actions">
              <el-button
                type="primary"
                :loading="uploading"
                :disabled="!selectedFile"
                @click="handleUpload"
              >
                <el-icon><Upload /></el-icon>
                <span>开始上传</span>
              </el-button>
            </div>

            <!-- Upload Result -->
            <div v-if="uploadResult" class="upload-result">
              <div class="result-header">
                <el-icon :size="20" :color="uploadResult.failCount > 0 ? '#f59e0b' : '#10b981'">
                  <CircleCheckFilled v-if="uploadResult.failCount === 0" />
                  <WarningFilled v-else />
                </el-icon>
                <span>上传完成</span>
              </div>
              <div class="result-stats">
                <span class="result-success">成功: {{ uploadResult.successCount }}</span>
                <span class="result-fail">失败: {{ uploadResult.failCount }}</span>
              </div>
              <div v-if="uploadResult.errors && uploadResult.errors.length > 0" class="result-errors">
                <div class="error-title">错误详情:</div>
                <div v-for="(err, idx) in uploadResult.errors" :key="idx" class="error-item">
                  {{ err }}
                </div>
              </div>
            </div>

            <!-- Format Requirements -->
            <div class="format-info">
              <h4>Excel 格式要求</h4>
              <ul>
                <li>第一行为表头，字段顺序: 标题、内容、摘要、来源URL、风险等级、报送单位</li>
                <li>风险等级可选值: high(高危)、medium(中危)、low(低危)、info(信息)</li>
                <li>标题为必填项，其余字段可选</li>
                <li>单次上传最多支持 1000 条记录</li>
              </ul>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Detail Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="报告详情"
      :size="480"
      direction="rtl"
      :destroy-on-close="true"
    >
      <div v-if="currentReport" class="detail-content">
        <h3 class="detail-title">{{ currentReport.title }}</h3>
        <div class="detail-tags">
          <el-tag :type="riskTagType(currentReport.riskLevel)" size="small" effect="dark">
            {{ riskLabel(currentReport.riskLevel) }}
          </el-tag>
          <el-tag :type="reviewTagType(currentReport.reviewStatus)" size="small">
            {{ reviewLabel(currentReport.reviewStatus) }}
          </el-tag>
        </div>
        <el-divider />
        <div class="detail-row">
          <span class="detail-label">创建时间</span>
          <span class="detail-value">{{ currentReport.createdTime }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">更新时间</span>
          <span class="detail-value">{{ currentReport.updatedTime }}</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import {
  getMyReports,
  uploadReport,
  type RiskReport,
  type UploadResult,
} from '@/api/riskReport'

const activeTab = ref('my-reports')
const loading = ref(false)
const uploading = ref(false)
const drawerVisible = ref(false)
const reportList = ref<RiskReport[]>([])
const currentReport = ref<RiskReport | null>(null)
const selectedFile = ref<File | null>(null)
const uploadResult = ref<UploadResult | null>(null)
const uploadRef = ref<UploadInstance>()

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

function riskTagType(level: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
    info: 'info',
  }
  return map[level] || 'info'
}

function riskLabel(level: string): string {
  const map: Record<string, string> = { high: '高危', medium: '中危', low: '低危', info: '信息' }
  return map[level] || level
}

function reviewTagType(status: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  if (status === 10) return 'warning'
  if (status === 20) return 'success'
  if (status === 40) return 'danger'
  return 'info'
}

function reviewLabel(status: number): string {
  if (status === 10) return '待审核'
  if (status === 20) return '已审核'
  if (status === 40) return '已驳回'
  return '未知'
}

async function fetchReports() {
  loading.value = true
  try {
    const res = await getMyReports({ page: pagination.page, size: pagination.size })
    const data = res as any
    reportList.value = data?.rows || data?.records || data?.list || data?.data || []
    pagination.total = data?.total || 0
  } catch {
    reportList.value = []
  } finally {
    loading.value = false
  }
}

function openDetail(row: RiskReport) {
  currentReport.value = row
  drawerVisible.value = true
}

function handleFileChange(file: UploadFile) {
  selectedFile.value = file.raw || null
}

function handleFileRemove() {
  selectedFile.value = null
}

function handleExceed() {
  ElMessage.warning('只能上传一个文件，请先移除已选文件')
}

async function handleUpload() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  uploading.value = true
  uploadResult.value = null
  try {
    const res = await uploadReport(selectedFile.value)
    uploadResult.value = (res as unknown as UploadResult) || { successCount: 0, failCount: 0, errors: [] }
    ElMessage.success('上传完成')
    // Refresh list
    fetchReports()
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

function downloadTemplate() {
  // Trigger template download
  ElMessage.info('模板下载功能需要后端支持')
}

onMounted(() => {
  fetchReports()
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

.table-wrap {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  padding: 16px;

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: rgba(15, 23, 42, 0.5);
    --el-table-row-hover-bg-color: rgba(59, 130, 246, 0.08);
    --el-table-border-color: rgba(59, 130, 246, 0.1);
    --el-table-text-color: #e2e8f0;
    --el-table-header-text-color: #94a3b8;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: #94a3b8;
    --el-pagination-button-bg-color: rgba(30, 41, 59, 0.8);
    --el-pagination-hover-color: #3b82f6;
  }
}

// Upload Section
.upload-section {
  display: flex;
  justify-content: center;
}

.upload-card {
  width: 100%;
  max-width: 680px;
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

.upload-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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

// Detail Drawer
.detail-content {
  padding: 0 4px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.detail-tags {
  display: flex;
  gap: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.detail-label {
  width: 72px;
  flex-shrink: 0;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #1e293b;
  word-break: break-all;
}
</style>
