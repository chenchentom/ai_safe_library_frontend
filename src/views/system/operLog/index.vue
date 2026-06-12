<template>
  <div class="page-container system-admin">
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="模块">
          <el-input v-model="searchForm.title" placeholder="操作模块" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select
            v-model="searchForm.businessType"
            placeholder="全部"
            clearable
            popper-class="system-admin-popper"
            style="width: 120px"
          >
            <el-option v-for="opt in businessTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人员">
          <el-input v-model="searchForm.operName" placeholder="操作人员" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable popper-class="system-admin-popper" style="width: 100px">
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD HH:mm:ss"
            popper-class="system-admin-popper"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-loading="loading" class="table-container">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="operId" label="编号" width="80" align="center" />
        <el-table-column prop="title" label="操作模块" min-width="120" show-overflow-tooltip />
        <el-table-column prop="businessTypeLabel" label="业务类型" width="90" align="center" />
        <el-table-column prop="operName" label="操作人员" width="110" show-overflow-tooltip />
        <el-table-column prop="deptName" label="部门" width="120" show-overflow-tooltip />
        <el-table-column prop="operIp" label="IP" width="130" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small" effect="plain">
              {{ row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operTime" label="操作时间" width="170" />
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          popper-class="app-pagination-popper"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      width="920px"
      class="oper-log-detail-dialog"
      modal-class="oper-log-detail-overlay"
      :show-close="true"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      align-center
    >
      <template v-if="detailRow" #header>
        <div class="oper-log-detail__header">
          <div class="oper-log-detail__title-block">
            <span class="oper-log-detail__id">#{{ detailRow.operId }}</span>
            <h3 class="oper-log-detail__title">{{ detailRow.title || '操作记录' }}</h3>
          </div>
          <div class="oper-log-detail__badges">
            <span class="oper-log-detail__badge" :class="businessTypeBadgeClass">
              <el-icon><CollectionTag /></el-icon>
              {{ detailRow.businessTypeLabel }}
            </span>
            <span
              class="oper-log-detail__badge"
              :class="detailRow.status === 0 ? 'oper-log-detail__badge--success' : 'oper-log-detail__badge--fail'"
            >
              <el-icon><component :is="detailRow.status === 0 ? CircleCheck : CircleClose" /></el-icon>
              {{ detailRow.status === 0 ? '执行成功' : '执行失败' }}
            </span>
            <span v-if="detailRow.costTime != null" class="oper-log-detail__badge oper-log-detail__badge--type">
              <el-icon><Timer /></el-icon>
              {{ formatCostTime(detailRow.costTime) }}
            </span>
          </div>
        </div>
      </template>

      <div v-loading="detailLoading" class="oper-log-detail__scroll">
        <div v-if="detailRow" class="oper-log-detail__body">
          <section class="oper-log-detail__section">
            <div class="oper-log-detail__section-title">
              <el-icon><User /></el-icon>
              操作主体
            </div>
            <div class="oper-log-detail__grid">
              <div class="oper-log-detail__cell">
                <span class="oper-log-detail__label">操作人员</span>
                <span class="oper-log-detail__value">{{ detailRow.operName || '—' }}</span>
              </div>
              <div class="oper-log-detail__cell">
                <span class="oper-log-detail__label">所属部门</span>
                <span class="oper-log-detail__value">{{ detailRow.deptName || '—' }}</span>
              </div>
              <div class="oper-log-detail__cell">
                <span class="oper-log-detail__label">操作时间</span>
                <span class="oper-log-detail__value oper-log-detail__value--mono">{{ detailRow.operTime || '—' }}</span>
              </div>
              <div class="oper-log-detail__cell">
                <span class="oper-log-detail__label">来源 IP</span>
                <span class="oper-log-detail__value oper-log-detail__value--mono">{{ detailRow.operIp || '—' }}</span>
              </div>
              <div v-if="detailRow.operLocation" class="oper-log-detail__cell oper-log-detail__cell--full">
                <span class="oper-log-detail__label">操作地点</span>
                <span class="oper-log-detail__value">{{ detailRow.operLocation }}</span>
              </div>
            </div>
          </section>

          <section class="oper-log-detail__section">
            <div class="oper-log-detail__section-title">
              <el-icon><Connection /></el-icon>
              请求追踪
            </div>
            <div class="oper-log-detail__grid">
              <div class="oper-log-detail__cell">
                <span class="oper-log-detail__label">HTTP 方法</span>
                <span class="oper-log-detail__value oper-log-detail__value--mono">{{ detailRow.requestMethod || '—' }}</span>
              </div>
              <div class="oper-log-detail__cell">
                <span class="oper-log-detail__label">业务类型码</span>
                <span class="oper-log-detail__value oper-log-detail__value--mono">{{ detailRow.businessType }}</span>
              </div>
              <div class="oper-log-detail__cell oper-log-detail__cell--full">
                <span class="oper-log-detail__label">服务方法</span>
                <span class="oper-log-detail__value oper-log-detail__value--mono">{{ detailRow.method || '—' }}</span>
              </div>
              <div class="oper-log-detail__cell oper-log-detail__cell--full">
                <span class="oper-log-detail__label">请求路径</span>
                <span class="oper-log-detail__value oper-log-detail__value--mono">{{ detailRow.operUrl || '—' }}</span>
              </div>
            </div>
          </section>

          <section v-if="detailRow.errorMsg" class="oper-log-detail__section">
            <div class="oper-log-detail__section-title">
              <el-icon><WarningFilled /></el-icon>
              异常信息
            </div>
            <p class="oper-log-detail__error">{{ detailRow.errorMsg }}</p>
          </section>

          <section class="oper-log-detail__section">
            <div class="oper-log-detail__section-title">
              <el-icon><Document /></el-icon>
              请求参数
            </div>
            <div class="oper-log-detail__code-block">
              <div class="oper-log-detail__code-header">
                <span class="oper-log-detail__code-label">oper_param · 完整内容</span>
                <el-button
                  v-if="detailRow.operParam"
                  link
                  type="primary"
                  size="small"
                  :icon="CopyDocument"
                  @click="copyText(formatJson(detailRow.operParam), '请求参数')"
                >
                  复制
                </el-button>
              </div>
              <pre class="oper-log-detail__code">{{ formatJson(detailRow.operParam) }}</pre>
            </div>
          </section>

          <section v-if="detailRow.jsonResult" class="oper-log-detail__section">
            <div class="oper-log-detail__section-title">
              <el-icon><Tickets /></el-icon>
              返回结果
            </div>
            <div class="oper-log-detail__code-block">
              <div class="oper-log-detail__code-header">
                <span class="oper-log-detail__code-label">json_result · 完整内容</span>
                <el-button
                  link
                  type="primary"
                  size="small"
                  :icon="CopyDocument"
                  @click="copyText(formatJson(detailRow.jsonResult), '返回结果')"
                >
                  复制
                </el-button>
              </div>
              <pre class="oper-log-detail__code">{{ formatJson(detailRow.jsonResult) }}</pre>
            </div>
          </section>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="detailVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onDeactivated, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  User,
  Connection,
  Document,
  CollectionTag,
  CircleCheck,
  CircleClose,
  WarningFilled,
  CopyDocument,
  Timer,
  Tickets,
} from '@element-plus/icons-vue'
import { getOperLogList, getOperLogDetail, type OperLogItem } from '@/api/operLog'
import { resetPageLoading } from '@/utils/cleanupOverlays'

const loading = ref(false)
const tableData = ref<OperLogItem[]>([])
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailRow = ref<OperLogItem | null>(null)

const searchForm = reactive({
  title: '',
  businessType: undefined as number | undefined,
  operName: '',
  status: undefined as number | undefined,
  dateRange: [] as string[],
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const businessTypeOptions = [
  { value: 0, label: '其它' },
  { value: 1, label: '新增' },
  { value: 2, label: '修改' },
  { value: 3, label: '删除' },
  { value: 4, label: '审核' },
  { value: 5, label: '授权' },
  { value: 6, label: '导入' },
]

const businessTypeBadgeClass = computed(() => {
  const type = detailRow.value?.businessType
  if (type === 3) return 'oper-log-detail__badge--delete'
  if (type === 4) return 'oper-log-detail__badge--review'
  if (type === 1) return 'oper-log-detail__badge--insert'
  return 'oper-log-detail__badge--type'
})

function resetPageState() {
  resetPageLoading(loading)
  detailLoading.value = false
  detailVisible.value = false
  detailRow.value = null
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getOperLogList({
      title: searchForm.title || undefined,
      businessType: searchForm.businessType,
      operName: searchForm.operName || undefined,
      status: searchForm.status,
      beginTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1],
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    })
    tableData.value = res?.rows || []
    pagination.total = res?.total || 0
  } catch {
    tableData.value = []
    pagination.total = 0
    ElMessage.error('操作日志加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  fetchData()
}

function handleReset() {
  searchForm.title = ''
  searchForm.businessType = undefined
  searchForm.operName = ''
  searchForm.status = undefined
  searchForm.dateRange = []
  pagination.pageNum = 1
  fetchData()
}

async function openDetail(row: OperLogItem) {
  detailRow.value = row
  detailVisible.value = true
  detailLoading.value = true
  try {
    const full = await getOperLogDetail(row.operId)
    detailRow.value = full
  } catch {
    ElMessage.warning('拉取完整日志失败，展示列表摘要')
  } finally {
    detailLoading.value = false
  }
}

function formatJson(raw?: string) {
  if (!raw) return '—'
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function formatCostTime(ms?: number) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

async function copyText(text: string, label: string) {
  if (!text || text === '—') return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${label}已复制`)
  } catch {
    ElMessage.warning('复制失败，请手动选择复制')
  }
}

onMounted(fetchData)
onDeactivated(resetPageState)
onBeforeUnmount(resetPageState)
</script>
