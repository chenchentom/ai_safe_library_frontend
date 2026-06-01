export interface MenuItem {
  menuId: number
  parentId?: number
  menuName: string
  menuType: 'M' | 'C' | 'F' | string
  path?: string
  component?: string
  perms?: string
  icon?: string
  orderNum?: number
  children?: MenuItem[]
}
