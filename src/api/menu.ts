import { get } from './index'
import type { MenuItem } from '@/types/menu'

export function getMenuTree() {
  return get<MenuItem[]>('/system/menu/tree')
}
