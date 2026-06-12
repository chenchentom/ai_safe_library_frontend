import { get, post, put, del } from './index'

export interface DeptData {
  /** 雪花 ID 必须用字符串，避免 JS Number 精度丢失 */
  deptId?: string
  parentId?: string
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: string
  roleIds?: Array<number | string>
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

export function deleteDept(id: string) {
  return del('/system/dept/' + id)
}

export function getDeptRoleIds(deptId: string) {
  return get<string[]>(`/system/dept/${deptId}/roleIds`)
}

export function assignDeptRoles(deptId: string, roleIds: Array<number | string>) {
  return put(`/system/dept/${deptId}/roles`, { roleIds } as unknown as Record<string, unknown>)
}
