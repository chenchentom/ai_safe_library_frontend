import { get, post, put, del } from './index'
import service from './index'

function parseFilenameFromDisposition(disposition?: string): string | null {
  const utf8Match = disposition?.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])
  const plainMatch = disposition?.match(/filename="?([^";]+)"?/i)
  return plainMatch?.[1] ?? null
}

async function downloadExcelFile(url: string, defaultFilename: string) {
  const response = await service.get(url, { responseType: 'blob' })
  const blob = response.data as Blob
  const contentType = String(response.headers['content-type'] || '')
  if (contentType.includes('application/json')) {
    const text = await blob.text()
    const json = JSON.parse(text) as { msg?: string }
    throw new Error(json.msg || '导出失败')
  }
  const filename = parseFilenameFromDisposition(response.headers['content-disposition']) || defaultFilename
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  URL.revokeObjectURL(objectUrl)
}

/** 标签 ID（前端统一用 string，避免大整数精度问题） */
export type SupplyChainTagId = string

export interface SupplyChainTagV2Node {
  id: SupplyChainTagId
  label: string
  parentId: SupplyChainTagId
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
  id?: SupplyChainTagId
  parentId: SupplyChainTagId | number
  module?: string
  tagName: string
  tagCode: string
  description: string
  icon: string
  sortOrder: number
  status: string
}

function normalizeTagId(value: unknown): SupplyChainTagId {
  if (value === null || value === undefined || value === '') return '0'
  return String(value)
}

function normalizeTagNode(node: SupplyChainTagV2Node): SupplyChainTagV2Node {
  return {
    ...node,
    id: normalizeTagId(node.id),
    parentId: normalizeTagId(node.parentId),
    children: (node.children ?? []).map(normalizeTagNode),
  }
}

export async function getSupplyChainTagV2Tree() {
  const list = await get<SupplyChainTagV2Node[]>('/biz/supply-chain-tag-v2/tree')
  return (list ?? []).map(normalizeTagNode)
}

export function getSupplyChainTagV2ById(id: SupplyChainTagId) {
  return get<SupplyChainTagV2Node>(`/biz/supply-chain-tag-v2/${id}`)
}

export function addSupplyChainTagV2(data: SupplyChainTagV2Form) {
  return post('/biz/supply-chain-tag-v2', data as unknown as Record<string, unknown>)
}

export function updateSupplyChainTagV2(data: SupplyChainTagV2Form) {
  return put('/biz/supply-chain-tag-v2', data as unknown as Record<string, unknown>)
}

export function deleteSupplyChainTagV2(id: SupplyChainTagId) {
  return del(`/biz/supply-chain-tag-v2/${id}`)
}

export function searchSupplyChainTagV2(keyword: string) {
  return get<SupplyChainTagV2Node[]>('/biz/supply-chain-tag-v2/search', { keyword } as unknown as Record<string, unknown>)
}

export function updateSupplyChainTagV2Sort(id: SupplyChainTagId, sortOrder: number) {
  return put(`/biz/supply-chain-tag-v2/${id}/sort?sortOrder=${sortOrder}`)
}

/** 导出供应链标签 Excel */
export function exportSupplyChainTagV2() {
  return downloadExcelFile('/biz/supply-chain-tag-v2/export', '供应链标签.xlsx')
}
