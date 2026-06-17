import { get, post, put, del } from './index'
import type { RiskClueManualCreatePayload } from './riskClue'

/** 安全事件（已入库线索，字段与 biz_risk_clue 一致） */
export interface SecurityEvent {
  id: string
  number?: number
  event_name?: string
  eventName?: string
  class_human_1?: string
  classHuman1?: string
  class_human_2?: string
  classHuman2?: string
  class_human_list?: string[]
  classHumanList?: string[]
  risk_description_human?: string
  riskDescriptionHuman?: string
  operating_entity_human?: string
  operatingEntityHuman?: string
  source_url?: string
  sourceUrl?: string
  source_website?: string
  sourceWebsite?: string
  products_components_services?: string
  productsComponentsServices?: string
  is_warehouse?: number
  isWarehouse?: number
  audit_status?: number
  auditStatus?: number
  audit_user_name?: string
  auditUserName?: string
  audit_dept_name?: string
  auditDeptName?: string
  audit_time?: string
  auditTime?: string
  warehouse_time?: string
  warehouseTime?: string
  audit_reason?: string
  auditReason?: string
  content?: string
  risk_description?: string
  riskDescription?: string
  summary?: string
  class_report_1?: string
  classReport1?: string
  class_report_2?: string
  classReport2?: string
  class_report_list?: string[]
  classReportList?: string[]
  submission_channel?: string
  submissionChannel?: string
  submission_time?: string
  submissionTime?: string
  submit_user_name?: string
  submitUserName?: string
  submit_org_name?: string
  submitOrgName?: string
  operating_entity?: string
  operatingEntity?: string
  create_time?: string
  createTime?: string
  is_shared?: number
  isShared?: number
  share_time?: string
  shareTime?: string
  has_report?: number
  hasReport?: number
  is_verify?: number
  isVerify?: number
  is_submit?: number
  isSubmit?: number
  report_attachments?: Array<{ id?: string; file_name?: string; content_type?: string; size?: number }>
  reportAttachments?: Array<{ id?: string; fileName?: string; contentType?: string; size?: number }>
  /** 列表卡片用 */
  _cardCategories?: string[]
  _cardPrimaryCategory?: string
  _cardCategoryColorIndex?: number
  _cardTime?: string
}

export interface SecurityEventStats {
  total: number
}

export interface SecurityEventSearchParams {
  keyword?: string
  auditRiskCategory?: string
  sourceWebsite?: string
  operatingEntityHuman?: string
  productsComponentsServices?: string
  submissionChannel?: string
  submitUserName?: string
  submitOrgName?: string
  auditUserName?: string
  auditStartTime?: string
  auditEndTime?: string
  /** 是否验证：0=否，1=是 */
  isVerify?: number
  /** 是否报送：0=否，1=是 */
  isSubmit?: number
  page?: number
  size?: number
}

export function searchEvents(params: SecurityEventSearchParams) {
  return get('/business/security-event/search', params as unknown as Record<string, unknown>)
}

export function getEventById(id: string) {
  return get<SecurityEvent>(`/business/security-event/${id}`)
}

export function getEventStats() {
  return get<SecurityEventStats>('/business/security-event/stats')
}

// 删除安全事件（底层为同一条线索记录）
export function deleteSecurityEvent(id: string) {
  return del(`/business/risk-clue/${id}`)
}

/** 切换安全事件共享状态 */
export function toggleSecurityEventShare(id: string) {
  return put<{ isShared: number; shareTime: string | null }>(`/business/security-event/${id}/share`)
}

// 手动新增安全事件（自动审核入库）
export function createSecurityEvent(data: RiskClueManualCreatePayload) {
  return post<{ id: string }>('/business/security-event', data as unknown as Record<string, unknown>)
}
