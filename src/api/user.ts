import { get, post, put, del } from './index'

export interface UserQueryParams {
  userName?: string
  phonenumber?: string
  status?: string
  pageNum: number
  pageSize: number
}

export interface UserData {
  userId?: number
  userName: string
  nickName: string
  deptId?: number
  phonenumber?: string
  email?: string
  status: string
}

export function getUserList(params: UserQueryParams) {
  return get('/system/user/list', params as unknown as Record<string, unknown>)
}

export function addUser(data: UserData) {
  return post('/system/user', data as unknown as Record<string, unknown>)
}

export function updateUser(data: UserData) {
  return put('/system/user', data as unknown as Record<string, unknown>)
}

export function deleteUser(ids: number[]) {
  return del('/system/user/' + ids.join(','))
}

export function resetPassword(userId: number) {
  return put('/system/user/resetPwd', { userId } as unknown as Record<string, unknown>)
}
