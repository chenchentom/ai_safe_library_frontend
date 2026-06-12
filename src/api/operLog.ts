import { get } from './index'

export interface OperLogQueryParams {
  title?: string
  businessType?: number
  operName?: string
  status?: number
  beginTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}

export interface OperLogItem {
  operId: number
  title: string
  businessType: number
  businessTypeLabel: string
  method: string
  requestMethod: string
  operName: string
  deptName?: string
  operUrl?: string
  operIp?: string
  operLocation?: string
  operParam?: string
  jsonResult?: string
  status: number
  errorMsg?: string
  operTime?: string
  costTime?: number
}

export interface OperLogListResult {
  rows: OperLogItem[]
  total: number
}

export function getOperLogList(params: OperLogQueryParams) {
  return get<OperLogListResult>('/system/oper-log/list', params as unknown as Record<string, unknown>)
}

export function getOperLogDetail(id: number) {
  return get<OperLogItem>(`/system/oper-log/${id}`)
}
