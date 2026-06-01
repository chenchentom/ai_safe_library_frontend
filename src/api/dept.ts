import { get, post, put, del } from './index'

export interface DeptData {
  deptId?: number
  parentId?: number
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: string
}

export function getDeptList() {
  return get('/system/dept/list')
}

export function addDept(data: DeptData) {
  return post('/system/dept', data as unknown as Record<string, unknown>)
}

export function updateDept(data: DeptData) {
  return put('/system/dept', data as unknown as Record<string, unknown>)
}

export function deleteDept(id: number) {
  return del('/system/dept/' + id)
}

export function getDeptRoleIds(deptId: number) {
  return get<number[]>(`/system/dept/${deptId}/roleIds`)
}

export function assignDeptRoles(deptId: number, roleIds: number[]) {
  return put(`/system/dept/${deptId}/roles`, { roleIds } as unknown as Record<string, unknown>)
}
