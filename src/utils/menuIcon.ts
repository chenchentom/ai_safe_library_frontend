import type { Component } from 'vue'
import {
  CircleCloseFilled,
  CollectionTag,
  DataAnalysis,
  Document,
  HomeFilled,
  Link,
  Monitor,
  OfficeBuilding,
  Setting,
  Upload,
  User,
  UserFilled,
  Warning,
} from '@element-plus/icons-vue'

const iconMap: Record<string, Component> = {
  HomeFilled,
  Warning,
  Document,
  Upload,
  CollectionTag,
  Setting,
  User,
  UserFilled,
  OfficeBuilding,
  DataAnalysis,
  Link,
  CircleCloseFilled,
  Monitor,
}

export function resolveMenuIcon(name?: string): Component {
  if (!name) return Monitor
  return iconMap[name] || Monitor
}

export function collectMenuPaths(menus: import('@/types/menu').MenuItem[]): string[] {
  const paths: string[] = []
  const walk = (items: import('@/types/menu').MenuItem[]) => {
    for (const item of items) {
      if (item.path && item.menuType === 'C') {
        paths.push(item.path)
      }
      if (item.children?.length) {
        walk(item.children)
      }
    }
  }
  walk(menus)
  return paths
}
