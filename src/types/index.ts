// 全局类型定义
export interface PageResult<T> {
  rows: T[]
  total: number
}

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}
