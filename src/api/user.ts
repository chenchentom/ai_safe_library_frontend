import { get, post, put, del } from './index'

export interface UserQueryParams {
  userName?: string
  phonenumber?: string
  status?: string
  pageNum: number
  pageSize: number
}

export interface UserData {
  /** 雪花 ID 必须用字符串，避免 JS Number 精度丢失 */
  userId?: string
  userName: string
  nickName: string
  deptId?: number | string
  phonenumber?: string
  email?: string
  status: string
  roleIds?: Array<number | string>
  /** 仅新增时提交 */
  password?: string
}

export function getUserList(params: UserQueryParams) {
  return get('/system/user/list', params as unknown as Record<string, unknown>)
}

export function getUser(userId: string) {
  return get(`/system/user/${userId}`)
}

export function addUser(data: UserData) {
  return post('/system/user', data as unknown as Record<string, unknown>)
}

export function updateUser(data: UserData) {
  const payload: Record<string, unknown> = {
    userId: data.userId != null ? String(data.userId) : undefined,
    userName: data.userName,
    nickName: data.nickName,
    deptId: data.deptId != null && data.deptId !== '' ? String(data.deptId) : undefined,
    phonenumber: data.phonenumber,
    email: data.email,
    status: data.status,
    roleIds: data.roleIds?.map((id) => Number(id)),
  }
  return put('/system/user', payload)
}

export function deleteUser(ids: Array<string | number>) {
  return del('/system/user/' + ids.map((id) => String(id)).join(','))
}

export function resetPassword(userId: string, password: string) {
  return put('/system/user/resetPwd', { userId, password } as unknown as Record<string, unknown>)
}

export function checkUserUnique(params: {
  userName?: string
  nickName?: string
  userId?: string
}) {
  return get<{ userNameUnique?: boolean; nickNameUnique?: boolean }>(
    '/system/user/checkUnique',
    params as unknown as Record<string, unknown>
  )
}
