import { get, post, del } from '@/api/index'

export interface RiskClue {
  id: string
  number?: number
  event_name?: string
  eventName?: string
  title?: string
  content: string
  risk_description?: string
  riskDescription?: string
  summary?: string
  source_url?: string
  sourceUrl?: string
  url?: string
  source_website?: string
  sourceWebsite?: string
  siteName?: string
  sourceType?: string
  submission_channel?: string
  submissionChannel?: string
  submit_user_name?: string
  submitUserName?: string
  submission_time?: string
  submissionTime?: string
  submit_org_name?: string
  submitOrgName?: string
  reportUnit?: string
  riskLevel?: string
  audit_status?: number
  auditStatus?: number
  reviewStatus?: number
  isWarehouse?: number
  is_verify?: number
  isVerify?: number
  tags?: string[]
  class_report_1?: string
  classReport1?: string
  class_report_2?: string
  classReport2?: string
  class_report_list?: string[]
  classReportList?: string[]
  class_human_1?: string
  classHuman1?: string
  class_human_2?: string
  classHuman2?: string
  class_human_list?: string[]
  classHumanList?: string[]
  classNameModel?: string[]
  classNameHuman?: string[]
  createdTime?: string
  create_time?: string
  createTime?: string
  updatedTime?: string
  update_time?: string
  updateTime?: string
  operating_entity?: string
  operatingEntity?: string
  products_components_services?: string
  productsComponentsServices?: string
  operatingEntityHuman?: string
  riskDescriptionHuman?: string
  is_warehouse?: number
  isWarehouse?: number
  audit_user_name?: string
  auditUserName?: string
  audit_dept_name?: string
  auditDeptName?: string
  audit_time?: string
  auditTime?: string
  audit_reason?: string
  auditReason?: string
  deleted?: number
  /** 列表卡片展示用，由 normalizeClueData 填充 */
  _cardCategories?: string[]
}

export interface TagCategory {
  id: number
  label: string
  parentId: number
  tagCode: string
  tagLevel: number
  tagPath: string
  sortOrder: number
  status: string
  description: string
  icon: string
  children?: TagCategory[]
}

// 审核提交 DTO
export interface ReviewDTO {
  clueId: string
  isWarehouse: number
  riskCategory?: string
  riskDescriptionHuman?: string
  operatingEntityHuman?: string
  reviewComment?: string
}

// 审核记录
export interface ReviewRecord {
  id: string
  clueId?: string
  clue_id?: string
  isWarehouse?: number
  is_warehouse?: number
  classHuman1?: string
  class_human_1?: string
  classHuman2?: string
  class_human_2?: string
  classHumanList?: string[]
  class_human_list?: string[]
  riskCategory?: string
  risk_category?: string
  riskDescriptionHuman?: string
  risk_description_human?: string
  operatingEntityHuman?: string
  operating_entity_human?: string
  reviewResult?: string
  review_result?: string
  /** @deprecated 旧版审核记录 */
  reviewTags?: string[]
  reviewComment?: string
  review_comment?: string
  reviewer: string
  reviewerName?: string
  reviewer_name?: string
  reviewDept?: string
  review_dept?: string
  reviewTime?: string
  review_time?: string
}

// 统计数据
export interface RiskClueStats {
  total: number
  pending: number
  reviewed: number
  rejected: number
}

// 搜索参数
export interface RiskClueSearchParams {
  keyword?: string
  /** 报送类别 class_report_* */
  riskCategory?: string
  reviewStatus?: number
  isWarehouse?: number
  /** 审核类别 class_human_* */
  auditRiskCategory?: string
  operatingEntityHuman?: string
  auditUserName?: string
  auditStartTime?: string
  auditEndTime?: string
  sourceWebsite?: string
  operatingEntity?: string
  submissionChannel?: string
  productsComponentsServices?: string
  submissionStartTime?: string
  submissionEndTime?: string
  /** @deprecated 兼容旧参数 */
  riskLevel?: string
  sourceType?: string
  startTime?: string
  endTime?: string
  page?: number
  size?: number
}

// 搜索风险线索
export function searchRiskClue(params: RiskClueSearchParams) {
  return get('/business/risk-clue/search', params as unknown as Record<string, unknown>)
}

// 获取风险线索详情
export function getRiskClueById(id: string) {
  return get<RiskClue>(`/business/risk-clue/${id}`)
}

// 审核线索
export function reviewClue(data: ReviewDTO) {
  return post('/business/risk-clue/review', data as unknown as Record<string, unknown>)
}

// 获取审核历史
export function getReviewHistory(clueId: string) {
  return get<ReviewRecord[]>(`/business/risk-clue/${clueId}/review-history`)
}

// 获取统计信息
export function getRiskClueStats() {
  return get<RiskClueStats>('/business/risk-clue/stats')
}

// 删除线索
export function deleteRiskClue(id: string) {
  return del(`/business/risk-clue/${id}`)
}

// 获取标签树
export function getTagTree(module = 'risk_clue') {
  return get<TagCategory[]>('/system/tag/tree', { module })
}
