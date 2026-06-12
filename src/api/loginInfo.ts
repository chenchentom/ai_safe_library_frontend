import { get } from './index'

export interface LoginInfoQueryParams {
  userName?: string
  status?: string
  beginTime?: string
  endTime?: string
  pageNum: number
  pageSize: number
}

export interface LoginInfoItem {
  infoId: number
  userName: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  status: string
  msg?: string
  loginTime?: string
}

export interface LoginInfoListResult {
  rows: LoginInfoItem[]
  total: number
}

export function getLoginInfoList(params: LoginInfoQueryParams) {
  return get<LoginInfoListResult>('/system/login-info/list', params as unknown as Record<string, unknown>)
}
