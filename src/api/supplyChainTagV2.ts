import { get, post, put, del } from './index'

export interface SupplyChainTagV2Node {
  id: number
  label: string
  parentId: number
  parentName?: string
  module?: string
  tagCode: string
  tagLevel: number
  tagPath: string
  sortOrder: number
  status: string
  description: string
  icon: string
  children: SupplyChainTagV2Node[]
}

export interface SupplyChainTagV2Form {
  id?: number
  parentId: number
  module?: string
  tagName: string
  tagCode: string
  description: string
  icon: string
  sortOrder: number
  status: string
}

export function getSupplyChainTagV2Tree() {
  return get<SupplyChainTagV2Node[]>('/biz/supply-chain-tag-v2/tree')
}

export function getSupplyChainTagV2ById(id: number) {
  return get<SupplyChainTagV2Node>(`/biz/supply-chain-tag-v2/${id}`)
}

export function addSupplyChainTagV2(data: SupplyChainTagV2Form) {
  return post('/biz/supply-chain-tag-v2', data as unknown as Record<string, unknown>)
}

export function updateSupplyChainTagV2(data: SupplyChainTagV2Form) {
  return put('/biz/supply-chain-tag-v2', data as unknown as Record<string, unknown>)
}

export function deleteSupplyChainTagV2(id: number) {
  return del(`/biz/supply-chain-tag-v2/${id}`)
}

export function searchSupplyChainTagV2(keyword: string) {
  return get<SupplyChainTagV2Node[]>('/biz/supply-chain-tag-v2/search', { keyword } as unknown as Record<string, unknown>)
}

export function updateSupplyChainTagV2Sort(id: number, sortOrder: number) {
  return put(`/biz/supply-chain-tag-v2/${id}/sort?sortOrder=${sortOrder}`)
}
