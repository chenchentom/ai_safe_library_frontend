import { get, post, put, del } from './index'

export interface RoleData {
  roleId?: number
  roleName: string
  roleKey: string
  roleSort?: number
  dataScope?: string
  status: string
  remark?: string
  menuIds?: number[]
}

export function getRoleList(params?: { roleName?: string; status?: string }) {
  return get<RoleData[]>('/system/role/list', params as Record<string, unknown>)
}

export function getRole(roleId: number) {
  return get<RoleData & { menuIds: number[] }>(`/system/role/${roleId}`)
}

export function addRole(data: RoleData) {
  return post('/system/role', data as unknown as Record<string, unknown>)
}

export function updateRole(data: RoleData) {
  return put('/system/role', data as unknown as Record<string, unknown>)
}

export function deleteRole(roleId: number) {
  return del(`/system/role/${roleId}`)
}
