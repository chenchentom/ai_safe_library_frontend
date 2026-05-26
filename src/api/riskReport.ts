import { get } from './index'
import service from './index'

// 风险报告
export interface RiskReport {
  id: string
  title: string
  riskLevel: string
  reviewStatus: number
  createdTime: string
  updatedTime: string
}

// 上传结果
export interface UploadResult {
  successCount: number
  failCount: number
  errors: string[]
}

// 获取我的报告
export function getMyReports(params?: { page?: number; size?: number }) {
  return get('/business/risk-report/my', params as unknown as Record<string, unknown>)
}

// 上传报告文件
export function uploadReport(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return service.post<UploadResult>('/business/risk-report/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 获取统计信息
export function getReportStats() {
  return get('/business/risk-report/stats')
}
