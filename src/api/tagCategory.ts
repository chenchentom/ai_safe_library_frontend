import { get, post, put, del } from './index'

// 标签分类树节点（后端返回的 raw 格式）
export interface TagCategoryNode {
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
  children: TagCategoryNode[]
}

// 标签表单数据
export interface TagCategoryForm {
  id?: number
  parentId: number
  module: string
  tagName: string
  tagCode: string
  description: string
  icon: string
  sortOrder: number
  status: string
}

// 获取树结构
export function getTagTree(module = 'risk_clue') {
  return get<TagCategoryNode[]>('/system/tag/tree', { module } as unknown as Record<string, unknown>)
}

// 获取单个标签
export function getTagById(id: number) {
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
export function deleteTag(id: number) {
  return del(`/system/tag/${id}`)
}

// 搜索
export function searchTag(keyword: string) {
  return get<TagCategoryNode[]>('/system/tag/search', { keyword } as unknown as Record<string, unknown>)
}

// 更新排序（sortOrder 以查询参数传递，后端 @RequestParam 接收）
export function updateTagSort(id: number, sortOrder: number) {
  return put(`/system/tag/${id}/sort?sortOrder=${sortOrder}`)
}
