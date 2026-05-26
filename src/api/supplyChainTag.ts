import { get, post, put, del } from './index'

export interface SupplyChainTag {
  id: number
  tagName: string
  parentId: number
  nodeType: 'stage' | 'sub_stage' | 'leaf'
  bizType?: string
  developer?: string
  intro?: string
  remark?: string
  level: number
  isLeaf: number
  tagPath: string
  ancestorIds: string
  sortOrder: number
  extInfo?: Record<string, unknown>
  status: number
  createTime: string
  updateTime: string
  children?: SupplyChainTag[]
}

export interface SupplyChainTagForm {
  id?: number
  tagName: string
  parentId: number
  nodeType: 'stage' | 'sub_stage' | 'leaf'
  bizType?: string
  developer?: string
  intro?: string
  remark?: string
  sortOrder?: number
  extInfo?: Record<string, unknown>
  status?: number
}

export function getSupplyChainTagTree() {
  return get<SupplyChainTag[]>('/biz/supply-chain-tag/tree')
}

export function getSupplyChainTagList(params?: {
  parentId?: number
  nodeType?: string
  keyword?: string
  page?: number
  size?: number
}) {
  return get<{ rows: SupplyChainTag[]; total: number }>('/biz/supply-chain-tag/list', params as unknown as Record<string, unknown>)
}

export function getSupplyChainTagById(id: number) {
  return get<SupplyChainTag>(`/biz/supply-chain-tag/${id}`)
}

export function addSupplyChainTag(data: SupplyChainTagForm) {
  return post('/biz/supply-chain-tag', data as unknown as Record<string, unknown>)
}

export function updateSupplyChainTag(data: SupplyChainTagForm) {
  return put('/biz/supply-chain-tag', data as unknown as Record<string, unknown>)
}

export function deleteSupplyChainTag(id: number) {
  return del(`/biz/supply-chain-tag/${id}`)
}

export function searchSupplyChainTag(keyword: string) {
  return get<SupplyChainTag[]>('/biz/supply-chain-tag/search', { keyword } as unknown as Record<string, unknown>)
}

export function importSupplyChainTag(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return post('/biz/supply-chain-tag/import', formData)
}

export function exportSupplyChainTag() {
  return get('/biz/supply-chain-tag/export')
}
