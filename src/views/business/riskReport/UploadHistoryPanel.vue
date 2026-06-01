<template>
  <div class="upload-history">
    <section class="upload-history__panel">
      <header class="upload-history__header">
        <div class="upload-history__header-left">
          <div class="upload-history__header-icon" aria-hidden="true">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="upload-history__header-text">
            <span class="upload-history__eyebrow">UPLOAD LOG · BATCH</span>
            <h3 class="upload-history__title-line">
              <span class="upload-history__title">上传历史</span>
              <span class="upload-history__title-sep" aria-hidden="true" />
              <span class="upload-history__subtitle">查看批量 Excel 报送记录与成功 / 失败明细</span>
            </h3>
          </div>
        </div>
        <div class="upload-history__filters">
          <el-input
            v-model="filters.keyword"
            class="upload-history__filter-input"
            placeholder="文件名"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="filters.status"
            class="upload-history__filter-select"
            placeholder="状态"
            clearable
          popper-class="app-pagination-popper"
          @change="handleSearch"
          >
            <el-option label="全部状态" value="" />
            <el-option label="处理中" value="processing" />
            <el-option label="全部成功" value="success" />
            <el-option label="部分失败" value="partial_fail" />
            <el-option label="失败" value="fail" />
          </el-select>
          <div class="upload-history__field">
            <el-icon class="upload-history__field-icon" aria-hidden="true"><User /></el-icon>
            <el-input
              v-model="filters.submitUserName"
              class="upload-history__filter-user"
              placeholder="报送人"
              clearable
              aria-label="报送人"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </div>
          <div class="upload-history__field upload-history__field--date">
            <el-icon class="upload-history__field-icon" aria-hidden="true"><Calendar /></el-icon>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="报送开始"
              end-placeholder="报送结束"
              value-format="YYYY-MM-DD"
              :editable="false"
              clearable
              class="upload-history__control--date"
              popper-class="upload-history-date-popper"
              aria-label="报送时间范围"
              @change="handleSearch"
            />
          </div>
          <el-button class="upload-history__filter-btn" @click="handleReset">重置</el-button>
          <el-button
            class="upload-history__refresh-btn"
            type="primary"
            plain
            size="small"
            :loading="loading"
            @click="fetchList"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </header>

      <div class="upload-history__meta">
        <span>共 <strong>{{ pagination.total }}</strong> 条上传批次</span>
      </div>

      <div class="upload-history__table-shell">
        <el-table
          v-loading="loading"
          :data="batchList"
          row-key="id"
          table-layout="fixed"
          class="upload-history__table"
          empty-text="暂无上传记录"
        >
          <!-- 主信息：文件名独占弹性列，其余按内容类型定宽 -->
          <el-table-column
            prop="fileName"
            label="文件名"
            :min-width="TABLE_COL.fileName"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="upload-history__file-cell">
                <el-icon class="upload-history__file-icon"><Document /></el-icon>
                <span class="upload-history__file-name">{{ row.fileName }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="submitTime" label="报送时间" :width="TABLE_COL.submitTime">
            <template #default="{ row }">
              <span class="upload-history__mono upload-history__time-cell">
                {{ formatSubmitTime(row.submitTime) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="submitUserName" label="报送人" :width="TABLE_COL.submitUser">
            <template #default="{ row }">
              <span class="upload-history__user-cell">{{ row.submitUserName || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="submitOrgName" label="报送部门" :width="TABLE_COL.submitOrg">
            <template #default="{ row }">
              <span class="upload-history__org-cell">{{ row.submitOrgName || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalCount" label="总条数" :width="TABLE_COL.total" align="center">
            <template #default="{ row }">
              <span class="upload-history__mono">{{ row.totalCount ?? 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="successCount" label="成功" :width="TABLE_COL.count" align="center">
            <template #default="{ row }">
              <span class="upload-history__stat upload-history__stat--success">{{ row.successCount ?? 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="failCount" label="失败" :width="TABLE_COL.count" align="center">
            <template #default="{ row }">
              <span
                class="upload-history__stat"
                :class="{ 'upload-history__stat--fail': row.failCount > 0 }"
              >
                {{ row.failCount ?? 0 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" :width="TABLE_COL.status" align="center">
            <template #default="{ row }">
              <span class="upload-history__status" :class="`is-${row.status}`">
                <span class="upload-history__status-dot" />
                {{ statusLabel(row.status) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" :width="TABLE_COL.action" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                class="upload-history__action-btn"
                @click="openDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="upload-history__pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          popper-class="app-pagination-popper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </section>

    <el-drawer
      v-model="drawerVisible"
      size="640px"
      destroy-on-close
      class="upload-history-drawer"
      modal-class="upload-history-drawer-overlay"
    >
      <template #header>
        <div class="upload-history-drawer__header">
          <div class="upload-history-drawer__header-beam" aria-hidden="true" />
          <span class="upload-history-drawer__eyebrow">UPLOAD BATCH · DETAIL</span>
          <h4 class="upload-history-drawer__title">上传详情</h4>
        </div>
      </template>

      <div v-if="currentBatch" class="upload-history-drawer__body">
        <section class="upload-history-drawer__summary">
          <span class="upload-history-drawer__summary-accent" aria-hidden="true" />
          <div class="upload-history-drawer__summary-grid">
            <div class="upload-history-drawer__summary-item">
              <span class="upload-history-drawer__summary-label">文件名</span>
              <span class="upload-history-drawer__summary-value">{{ currentBatch.fileName }}</span>
            </div>
            <div class="upload-history-drawer__summary-item">
              <span class="upload-history-drawer__summary-label">报送时间</span>
              <span class="upload-history-drawer__summary-value">{{ formatSubmitTime(currentBatch.submitTime) }}</span>
            </div>
            <div class="upload-history-drawer__summary-item">
              <span class="upload-history-drawer__summary-label">报送人</span>
              <span class="upload-history-drawer__summary-value">{{ currentBatch.submitUserName || '—' }}</span>
            </div>
            <div class="upload-history-drawer__summary-item">
              <span class="upload-history-drawer__summary-label">报送部门</span>
              <span class="upload-history-drawer__summary-value">{{ currentBatch.submitOrgName || '—' }}</span>
            </div>
          </div>
          <div class="upload-history-drawer__result-bar">
            <span class="upload-history-drawer__result-chip is-success">成功 {{ currentBatch.successCount }}</span>
            <span class="upload-history-drawer__result-chip is-fail">失败 {{ currentBatch.failCount }}</span>
            <span class="upload-history-drawer__result-chip is-total">共 {{ currentBatch.totalCount }}</span>
          </div>
          <p v-if="currentBatch.errorSummary" class="upload-history-drawer__error">
            {{ currentBatch.errorSummary }}
          </p>
        </section>

        <el-tabs v-model="detailTab" class="upload-history-drawer__tabs">
          <el-tab-pane :label="`失败明细 (${failDetails.length})`" name="fail">
            <div class="upload-history-drawer__table-wrap">
              <el-table
                v-loading="detailLoading"
                :data="failDetails"
                size="small"
                max-height="420"
                class="upload-history-drawer__table"
                empty-text="无失败记录"
              >
                <el-table-column prop="serialNo" label="序号" width="70" align="center">
                  <template #default="{ row }">
                    <span class="upload-history__mono">{{ row.serialNo ?? '—' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="eventName" label="事件名" min-width="140" show-overflow-tooltip />
                <el-table-column prop="errorMessage" label="失败原因" min-width="220" show-overflow-tooltip />
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="`成功明细 (${successDetails.length})`" name="success">
            <div class="upload-history-drawer__table-wrap">
              <el-table
                v-loading="detailLoading"
                :data="successDetails"
                size="small"
                max-height="420"
                class="upload-history-drawer__table"
                empty-text="无成功记录"
              >
                <el-table-column prop="serialNo" label="序号" width="70" align="center">
                  <template #default="{ row }">
                    <span class="upload-history__mono">{{ row.serialNo ?? '—' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="eventName" label="事件名" min-width="220" show-overflow-tooltip />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Refresh, Clock, Search, Document, User, Calendar } from '@element-plus/icons-vue'
import {
  getUploadBatches,
  getUploadBatchDetails,
  type UploadBatch,
  type UploadBatchListParams,
  type UploadDetail,
} from '@/api/riskReport'
import { formatDate } from '@/utils'

function formatSubmitTime(raw?: string): string {
  if (!raw) return '—'
  let s = String(raw).trim().replace('T', ' ').replace('Z', '')
  if (s.includes('.')) s = s.split('.')[0]
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    return formatDate(d, 'YYYY-MM-DD HH:mm:ss')
  }
  if (s.length >= 19) return s.slice(0, 19)
  return s
}

const loading = ref(false)
const detailLoading = ref(false)
const batchList = ref<UploadBatch[]>([])
const drawerVisible = ref(false)
const currentBatch = ref<UploadBatch | null>(null)
const detailTab = ref('fail')
const failDetails = ref<UploadDetail[]>([])
const successDetails = ref<UploadDetail[]>([])

const pagination = reactive({ page: 1, size: 10, total: 0 })

/** 列宽：时间/人/部门按完整展示定宽，文件名列弹性吸收剩余空间 */
const TABLE_COL = {
  fileName: 152,
  submitTime: 182,
  submitUser: 116,
  submitOrg: 200,
  total: 68,
  count: 60,
  status: 108,
  action: 96,
} as const

const filters = reactive({
  keyword: '',
  status: '' as string,
  submitUserName: '',
  dateRange: null as [string, string] | null,
})

function buildListParams(): UploadBatchListParams {
  const params: UploadBatchListParams = {
    page: pagination.page,
    size: pagination.size,
  }
  const keyword = filters.keyword.trim()
  if (keyword) params.keyword = keyword
  const submitUserName = filters.submitUserName.trim()
  if (submitUserName) params.submitUserName = submitUserName
  if (filters.status) params.status = filters.status
  if (filters.dateRange?.[0]) params.submitTimeStart = filters.dateRange[0]
  if (filters.dateRange?.[1]) params.submitTimeEnd = filters.dateRange[1]
  return params
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  filters.keyword = ''
  filters.status = ''
  filters.submitUserName = ''
  filters.dateRange = null
  pagination.page = 1
  fetchList()
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    processing: '处理中',
    success: '全部成功',
    partial_fail: '部分失败',
    fail: '失败',
  }
  return map[status] || status
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getUploadBatches(buildListParams())
    const data = res as { total?: number; rows?: UploadBatch[] }
    batchList.value = data?.rows || []
    pagination.total = data?.total || 0
  } catch {
    batchList.value = []
  } finally {
    loading.value = false
  }
}

async function openDetail(row: UploadBatch) {
  currentBatch.value = row
  drawerVisible.value = true
  detailTab.value = row.failCount > 0 ? 'fail' : 'success'
  detailLoading.value = true
  try {
    const [failRes, successRes] = await Promise.all([
      getUploadBatchDetails(row.id, { page: 1, size: 500, status: 'fail' }),
      getUploadBatchDetails(row.id, { page: 1, size: 500, status: 'success' }),
    ])
    failDetails.value = (failRes as { rows?: UploadDetail[] })?.rows || []
    successDetails.value = (successRes as { rows?: UploadDetail[] })?.rows || []
  } catch {
    failDetails.value = []
    successDetails.value = []
  } finally {
    detailLoading.value = false
  }
}

onMounted(fetchList)

defineExpose({ refresh: fetchList })
</script>

<style scoped lang="scss" src="./upload-history.scss"></style>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;

/* 列表表格：非 scoped 兜底，覆盖 EP 默认白底 */
.upload-history .upload-history__table-shell .el-table.upload-history__table {
  --el-table-bg-color: rgba(6, 12, 24, 0.65);
  --el-table-tr-bg-color: rgba(8, 14, 28, 0.92);
  --el-table-header-bg-color: rgba(4, 10, 22, 0.98);
  --el-table-row-hover-bg-color: rgba(79, 124, 255, 0.18);
  --el-table-border-color: rgba(79, 124, 255, 0.14);
  --el-table-text-color: rgba(235, 242, 255, 0.94);
  --el-table-header-text-color: rgba(190, 210, 240, 0.9);
  --el-bg-color: rgba(6, 12, 24, 0.65);
  --el-fill-color-blank: rgba(8, 14, 28, 0.92);
  background-color: rgba(6, 12, 24, 0.65) !important;
}

.upload-history .upload-history__table-shell .el-table.upload-history__table th.el-table__cell {
  background-color: rgba(4, 10, 22, 0.98) !important;
  color: rgba(190, 210, 240, 0.9) !important;
}

.upload-history .upload-history__table-shell .el-table.upload-history__table th.el-table__cell .cell,
.upload-history .upload-history__table-shell .el-table.upload-history__table td.el-table__cell .cell {
  color: rgba(235, 242, 255, 0.94) !important;
}

.upload-history .upload-history__table-shell .el-table.upload-history__table td.el-table__cell {
  background-color: rgba(8, 14, 28, 0.92) !important;
  color: rgba(235, 242, 255, 0.94) !important;
}

.upload-history .upload-history__table-shell .el-table.upload-history__table .el-table__body tr:hover > td.el-table__cell {
  background-color: rgba(79, 124, 255, 0.18) !important;
}

/* 报送时间范围面板（对齐安全事件库 sec-query-date-popper） */
.upload-history-date-popper.el-picker__popper {
  background: linear-gradient(180deg, rgba(14, 24, 44, 0.98), rgba(8, 14, 26, 0.99)) !important;
  border: 1px solid rgba(79, 124, 255, 0.22) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;
}

.upload-history-date-popper .el-picker-panel {
  background: transparent;
  color: rgba(230, 237, 247, 0.9);
}

.upload-history-date-popper .el-date-range-picker__header,
.upload-history-date-popper .el-date-table th {
  color: rgba(180, 195, 220, 0.75);
}

.upload-history-date-popper .el-date-table td.available .el-date-table-cell__text {
  color: rgba(220, 228, 245, 0.88);
}

.upload-history-date-popper .el-date-table td.in-range .el-date-table-cell {
  background: rgba(79, 124, 255, 0.12);
}

.upload-history-date-popper .el-date-table td.start-date .el-date-table-cell__text,
.upload-history-date-popper .el-date-table td.end-date .el-date-table-cell__text {
  background: rgba(79, 124, 255, 0.85);
  color: #fff;
}

.upload-history-date-popper .el-picker-panel__icon-btn {
  color: rgba(180, 195, 220, 0.75);
}

.upload-history-date-popper .el-picker-panel__icon-btn:hover {
  color: rgba(255, 255, 255, 0.95);
}

.upload-history-drawer-overlay {
  background:
    radial-gradient(ellipse 55% 45% at 50% 35%, rgba(30, 48, 90, 0.35), transparent 62%),
    rgba(2, 6, 14, 0.82) !important;
  backdrop-filter: blur(10px);
}

.upload-history-drawer.el-drawer {
  background:
    radial-gradient(ellipse 80% 50% at 100% 0%, rgba(79, 124, 255, 0.1), transparent 50%),
    linear-gradient(180deg, rgba(6, 12, 24, 0.99), rgba(3, 7, 16, 1)) !important;
  border-left: 1px solid rgba(79, 124, 255, 0.2);
  box-shadow: -28px 0 56px rgba(0, 0, 0, 0.5);
}

.upload-history-drawer .el-drawer__header {
  position: relative;
  margin-bottom: 0;
  padding: $spacing-5 $spacing-5 $spacing-4;
  border-bottom: 1px solid rgba(79, 124, 255, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.28));
}

.upload-history-drawer__header-beam {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 185, 80, 0.5) 25%,
    rgba(79, 124, 255, 0.7) 50%,
    rgba(255, 185, 80, 0.4) 75%,
    transparent
  );
}

.upload-history-drawer .el-drawer__close-btn {
  color: rgba(180, 190, 210, 0.75) !important;

  &:hover {
    color: rgba(255, 255, 255, 0.95) !important;
  }
}

.upload-history-drawer .el-drawer__body {
  padding: $spacing-5;
  background: transparent;
}

.upload-history-drawer__eyebrow {
  display: block;
  margin-bottom: 6px;
  font-family: $font-family-mono;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(255, 185, 80, 0.72);
}

.upload-history-drawer__title {
  margin: 0;
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.96);
}

.upload-history-drawer__summary {
  position: relative;
  margin-bottom: $spacing-4;
  padding: $spacing-4 $spacing-4 $spacing-4 calc(#{$spacing-4} + 8px);
  border-radius: $border-radius-lg;
  border: 1px solid rgba(79, 124, 255, 0.14);
  background: linear-gradient(135deg, rgba(10, 18, 36, 0.9), rgba(5, 10, 22, 0.95));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.upload-history-drawer__summary-accent {
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(
    180deg,
    rgba(255, 185, 80, 0.9) 0%,
    rgba(79, 124, 255, 0.7) 55%,
    rgba(79, 124, 255, 0.15) 100%
  );
  box-shadow: 0 0 14px rgba(79, 124, 255, 0.3);
}

.upload-history-drawer__summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-3 $spacing-4;
}

.upload-history-drawer__summary-label {
  display: block;
  margin-bottom: 4px;
  font-family: $font-family-mono;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(160, 180, 210, 0.62);
}

.upload-history-drawer__summary-value {
  display: block;
  font-size: $font-size-sm;
  color: rgba(235, 242, 255, 0.92);
  line-height: 1.5;
  word-break: break-word;
}

.upload-history-drawer__result-bar {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-top: $spacing-4;
  padding-top: $spacing-3;
  border-top: 1px solid rgba(79, 124, 255, 0.1);
}

.upload-history-drawer__result-chip {
  padding: 4px 11px;
  border-radius: $border-radius-full;
  font-family: $font-family-mono;
  font-size: 10px;
  letter-spacing: 0.04em;
  border: 1px solid transparent;

  &.is-success {
    color: rgba(52, 211, 153, 0.95);
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.24);
  }

  &.is-fail {
    color: rgba(251, 191, 36, 0.95);
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.24);
  }

  &.is-total {
    color: rgba(180, 210, 255, 0.92);
    background: rgba(79, 124, 255, 0.1);
    border-color: rgba(79, 124, 255, 0.24);
  }
}

.upload-history-drawer__error {
  margin: $spacing-3 0 0;
  font-size: $font-size-sm;
  color: rgba(248, 113, 113, 0.92);
  line-height: 1.55;
}

.upload-history-drawer__tabs {
  .el-tabs__header {
    margin-bottom: $spacing-3;
  }

  .el-tabs__nav-wrap::after {
    background-color: rgba(79, 124, 255, 0.12);
  }

  .el-tabs__item {
    font-family: $font-family-mono;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: rgba(160, 180, 210, 0.72);
  }

  .el-tabs__item.is-active {
    color: rgba(255, 200, 120, 0.95);
  }

  .el-tabs__active-bar {
    background: linear-gradient(90deg, rgba(255, 185, 80, 0.85), rgba(79, 124, 255, 0.85));
    box-shadow: 0 0 12px rgba(255, 185, 80, 0.25);
  }
}

.upload-history-drawer__table-wrap {
  border-radius: $border-radius-md;
  border: 1px solid rgba(79, 124, 255, 0.12);
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.upload-history-drawer__table-wrap .upload-history-drawer__table.el-table {
  --el-table-bg-color: rgba(6, 12, 24, 0.65);
  --el-table-tr-bg-color: rgba(8, 14, 28, 0.92);
  --el-table-header-bg-color: rgba(4, 10, 22, 0.98);
  --el-table-row-hover-bg-color: rgba(79, 124, 255, 0.18);
  --el-table-border-color: rgba(79, 124, 255, 0.14);
  --el-table-text-color: rgba(235, 242, 255, 0.94);
  --el-table-header-text-color: rgba(190, 210, 240, 0.9);
  --el-bg-color: rgba(6, 12, 24, 0.65);
  --el-fill-color-blank: rgba(8, 14, 28, 0.92);
  background-color: rgba(6, 12, 24, 0.65) !important;
  color: rgba(235, 242, 255, 0.94);
}

.upload-history-drawer__table-wrap .upload-history-drawer__table {
  .el-table__inner-wrapper::before {
    background-color: rgba(79, 124, 255, 0.18);
  }

  th.el-table__cell {
    font-family: $font-family-mono;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background-color: rgba(4, 10, 22, 0.98) !important;
    color: rgba(190, 210, 240, 0.9) !important;
    border-bottom: 1px solid rgba(79, 124, 255, 0.22) !important;
  }

  th.el-table__cell .cell {
    color: rgba(190, 210, 240, 0.9) !important;
  }

  td.el-table__cell {
    background-color: rgba(8, 14, 28, 0.92) !important;
    color: rgba(235, 242, 255, 0.94) !important;
    border-bottom-color: rgba(79, 124, 255, 0.1) !important;
  }

  td.el-table__cell .cell {
    color: rgba(235, 242, 255, 0.94) !important;
  }

  .el-table__body tr:hover > td.el-table__cell {
    background-color: rgba(79, 124, 255, 0.18) !important;
  }

  .el-table__body tr:hover > td.el-table__cell .cell {
    color: rgba(255, 255, 255, 0.98) !important;
  }

  .el-table__empty-text {
    color: rgba(180, 200, 230, 0.65);
  }

  .el-loading-mask {
    background-color: rgba(5, 10, 22, 0.85);
  }
}
</style>
