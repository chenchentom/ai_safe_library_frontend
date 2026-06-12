import { get, post, put, del } from './index'
import service from './index'

function parseFilenameFromDisposition(disposition?: string): string | null {
  const utf8Match = disposition?.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])
  const plainMatch = disposition?.match(/filename="?([^";]+)"?/i)
  return plainMatch?.[1] ?? null
}

async function downloadExcelFile(url: string, params: Record<string, unknown>, defaultFilename: string) {
  const response = await service.get(url, { params, responseType: 'blob' })
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

/** 标签 ID（雪花算法，前端必须用 string 避免精度丢失） */
export type TagId = string

// 标签分类树节点（后端返回的 raw 格式）
export interface TagCategoryNode {
  id: TagId
  label: string
  parentId: TagId
  tagCode: string
  tagLevel: number
  tagPath: string
  sortOrder: number
  status: string
  description: string
  icon: string
  children: TagCategoryNode[]
}

// 标签表单数据
export interface TagCategoryForm {
  id?: TagId
  parentId: TagId | number
  module: string
  tagName: string
  tagCode: string
  description: string
  icon: string
  sortOrder: number
  status: string
}

function normalizeTagId(value: unknown): TagId {
  if (value === null || value === undefined || value === '') return '0'
  return String(value)
}

function normalizeTagNode(node: TagCategoryNode): TagCategoryNode {
  return {
    ...node,
    id: normalizeTagId(node.id),
    parentId: normalizeTagId(node.parentId),
    children: (node.children ?? []).map(normalizeTagNode),
  }
}

// 获取树结构
export async function getTagTree(module = 'risk_clue') {
  const list = await get<TagCategoryNode[]>('/system/tag/tree', { module } as unknown as Record<string, unknown>)
  return (list ?? []).map(normalizeTagNode)
}

// 获取单个标签
export function getTagById(id: TagId) {
  return get<TagCategoryNode>(`/system/tag/${id}`)
}

// 新增
export function addTag(data: TagCategoryForm) {
  return post('/system/tag', data as unknown as Record<string, unknown>)
}

// 更新
export function updateTag(data: TagCategoryForm) {
  return put('/system/tag', data as unknown as Record<string, unknown>)
}

// 删除
export function deleteTag(id: TagId) {
  return del(`/system/tag/${id}`)
}

// 搜索
export function searchTag(keyword: string) {
  return get<TagCategoryNode[]>('/system/tag/search', { keyword } as unknown as Record<string, unknown>)
}

// 更新排序（sortOrder 以查询参数传递，后端 @RequestParam 接收）
export function updateTagSort(id: TagId, sortOrder: number) {
  return put(`/system/tag/${id}/sort?sortOrder=${sortOrder}`)
}

/** 导出标签 Excel */
export function exportTagCategory(module = 'risk_clue') {
  const defaultName = module === 'supply_chain' ? '供应链标签.xlsx' : '风险线索标签.xlsx'
  return downloadExcelFile('/system/tag/export', { module }, defaultName)
}
