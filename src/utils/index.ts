// 工具函数集合

/**
 * 从 localStorage 安全读取 token
 */
export function getToken(): string | null {
  return localStorage.getItem('token')
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return fmt
    .replace('YYYY', d.getFullYear().toString())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
}

/**
 * 树形数据转换
 */
export function listToTree<T extends Record<string, unknown>>(
  list: T[],
  idKey = 'id',
  parentKey = 'parentId'
): (T & { children?: T[] })[] {
  const map = new Map<unknown, T & { children?: T[] }>()
  const tree: (T & { children?: T[] })[] = []
  list.forEach(item => {
    map.set(item[idKey] as unknown, { ...item, children: [] })
  })
  list.forEach(item => {
    const node = map.get(item[idKey] as unknown)
    if (node) {
      const parent = map.get(item[parentKey] as unknown)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        tree.push(node)
      }
    }
  })
  return tree
}
