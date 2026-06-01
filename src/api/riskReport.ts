import { get, put } from './index'
import service from './index'
import type { RiskClueManualCreatePayload, RiskClueSearchParams, RiskClueStats } from './riskClue'

// 风险报告
export interface RiskReport {
  id: string
  title: string
  riskLevel: string
  reviewStatus: number
  createdTime: string
  updatedTime: string
}

export interface UploadBatch {
  id: number
  batchNo: string
  fileName: string
  filePath?: string
  fileSize?: number
  totalCount: number
  processedCount: number
  successCount: number
  failCount: number
  status: string
  submitUserId?: number
  submitUserName?: string
  submitOrgName?: string
  submitTime?: string
  finishTime?: string
  errorSummary?: string
}

export interface UploadDetail {
  id: number
  batchId: number
  serialNo?: number
  eventName?: string
  status: string
  clueId?: string
  errorMessage?: string
  createTime?: string
}

export interface UploadStartResult {
  batchId: number
  batchNo: string
  status: string
  fileName: string
}

export interface UploadProgress {
  batchId: number
  status: string
  totalCount: number
  processedCount: number
  successCount: number
  failCount: number
  percent: number
  errorSummary?: string
}

export interface UploadResult {
  batchId: number
  totalCount: number
  successCount: number
  failCount: number
  status: string
  errors: string[]
}

// 获取我的报告（简单列表，兼容旧调用）
export function getMyReports(params?: { page?: number; size?: number }) {
  return get('/business/risk-report/my', params as unknown as Record<string, unknown>)
}

/** 我的报送：与线索库相同的多条件搜索，服务端按当前用户部门过滤 submit_org_name */
export function searchMyReports(params: RiskClueSearchParams) {
  return get('/business/risk-report/search', params as unknown as Record<string, unknown>)
}

/** 我的报送统计（本部门维度） */
export function getMyReportStats() {
  return get<RiskClueStats>('/business/risk-report/stats')
}

/** 编辑本部门待审核报送的基础信息 */
export function updateMyReport(id: string, data: RiskClueManualCreatePayload) {
  return put<string>(`/business/risk-report/${id}`, data as unknown as Record<string, unknown>)
}

/** 共享线索：与线索库相同的多条件搜索，服务端仅返回 is_shared=1 的数据 */
export function searchSharedClues(params: RiskClueSearchParams) {
  return get('/business/risk-report/shared/search', params as unknown as Record<string, unknown>)
}

/** 共享线索统计 */
export function getSharedClueStats() {
  return get<RiskClueStats>('/business/risk-report/shared/stats')
}

/** 上传 Excel，返回批次 ID；onUploadProgress 映射文件上传阶段 0~40% */
export function uploadReport(
  file: File,
  onUploadProgress?: (percent: number) => void,
) {
  const formData = new FormData()
  formData.append('file', file)
  return service
    .post('/business/risk-report/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total || !onUploadProgress) return
        const uploadPart = Math.round((event.loaded / event.total) * 40)
        onUploadProgress(uploadPart)
      },
    })
    .then((res) => res as unknown as UploadStartResult)
}

/** 轮询服务端处理进度 */
export function getUploadProgress(batchId: number) {
  return get<UploadProgress>(`/business/risk-report/upload/batches/${batchId}/progress`)
}

export interface UploadBatchListParams {
  page?: number
  size?: number
  /** processing | success | partial_fail | fail */
  status?: string
  /** 文件名模糊搜索 */
  keyword?: string
  /** 报送人模糊搜索 */
  submitUserName?: string
  submitTimeStart?: string
  submitTimeEnd?: string
}

/** 上传历史列表 */
export function getUploadBatches(params?: UploadBatchListParams) {
  return get<{ total: number; rows: UploadBatch[] }>(
    '/business/risk-report/upload/batches',
    params as unknown as Record<string, unknown>,
  )
}

/** 上传批次详情 */
export function getUploadBatch(batchId: number) {
  return get<{ batch: UploadBatch }>(`/business/risk-report/upload/batches/${batchId}`)
}

/** 上传明细（可按 status=fail 筛选） */
export function getUploadBatchDetails(
  batchId: number,
  params?: { page?: number; size?: number; status?: string },
) {
  return get<{ total: number; rows: UploadDetail[] }>(
    `/business/risk-report/upload/batches/${batchId}/details`,
    params as unknown as Record<string, unknown>,
  )
}

// 获取统计信息（兼容旧调用）
export function getReportStats() {
  return getMyReportStats()
}

function parseFilenameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  return plainMatch?.[1] ?? null
}

/** 下载风险报送批量上传模板 */
export async function downloadReportTemplate() {
  const response = await service.get('/business/risk-report/template', {
    responseType: 'blob',
  })
  const blob = response.data as Blob
  const contentType = String(response.headers['content-type'] || '')
  if (contentType.includes('application/json')) {
    const text = await blob.text()
    const json = JSON.parse(text) as { msg?: string }
    throw new Error(json.msg || '模板下载失败')
  }
  const filename =
    parseFilenameFromDisposition(response.headers['content-disposition']) || '数据模版.xlsx'
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** 等待上传处理完成（40%~100% 由轮询驱动） */
export async function waitUploadComplete(
  batchId: number,
  onProgress?: (percent: number, progress: UploadProgress) => void,
): Promise<UploadProgress> {
  const poll = async (): Promise<UploadProgress> => {
    const progress = (await getUploadProgress(batchId)) as UploadProgress
    const serverPercent = Number(progress.percent ?? 0)
    const merged = Math.min(100, 40 + Math.round(serverPercent * 0.6))
    onProgress?.(merged, progress)
    if (['success', 'partial_fail', 'fail'].includes(progress.status)) {
      return progress
    }
    await new Promise((r) => setTimeout(r, 500))
    return poll()
  }
  return poll()
}
