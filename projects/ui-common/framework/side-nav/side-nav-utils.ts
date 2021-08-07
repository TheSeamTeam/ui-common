import { hasProperty } from '@theseam/ui-common/utils'

import {
  ISideNavBasic,
  ISideNavButton,
  ISideNavDivider,
  ISideNavItem,
  ISideNavItemState,
  ISideNavLink,
  ISideNavTitle,
  SideNavItemCanHaveChildren,
  SideNavItemCanHaveState
} from './side-nav.models'

export function isNavItemType(item: ISideNavItem, type: 'title'): item is ISideNavTitle
export function isNavItemType(item: ISideNavItem, type: 'divider'): item is ISideNavDivider
export function isNavItemType(item: ISideNavItem, type: 'basic'): item is ISideNavBasic
export function isNavItemType(item: ISideNavItem, type: 'link'): item is ISideNavLink
export function isNavItemType(item: ISideNavItem, type: 'button'): item is ISideNavButton
export function isNavItemType(item: ISideNavItem, type: string): item is ISideNavItem {
  return item.itemType === type
}

export function isNavItemActive(item: ISideNavItem): boolean {
  return item.__state?.active ?? false
}

export function isExpanded(item: ISideNavItem): boolean {
  return item.__state?.expanded ?? false
}

export function hasChildren(item: ISideNavItem): item is (ISideNavBasic | ISideNavLink) & Required<SideNavItemCanHaveChildren> {
  return canHaveChildren(item) && hasProperty(item, 'children') && item.children.length > 0
}

export function canHaveChildren(item: ISideNavItem): item is (ISideNavBasic | ISideNavLink) {
  return isNavItemType(item, 'basic') || isNavItemType(item, 'link')
}

export function hasActiveChild(item: ISideNavItem): boolean {
  if (!hasChildren(item)) {
    return false
  }

  for (const child of item.children) {
    if (getItemStateProp(child, 'active')) {
      return true
    }
  }

  return false
}

export function hasExpandedChild(item: ISideNavItem): boolean {
  if (!hasChildren(item)) {
    return false
  }

  for (const child of item.children) {
    if (getItemStateProp(child, 'expanded')) {
      return true
    }
  }

  return false
}

export function canBeActive(item: ISideNavItem): item is (ISideNavBasic | ISideNavLink) {
  return isNavItemType(item, 'basic') || isNavItemType(item, 'link')
}

export function canExpand(item: ISideNavItem): item is (ISideNavBasic | ISideNavLink) {
  return canHaveChildren(item)
}

export function findLinkItems(items: ISideNavItem[]): ISideNavLink[] {
  const linkItems: ISideNavLink[] = []

  const _fn = (_items: ISideNavItem[]) => {
    for (const item of _items) {
      if (isNavItemType(item, 'link')) {
        linkItems.push(item)
      }
      if (canHaveChildren(item) && hasProperty(item, 'children')) {
        _fn(item.children)
      }
    }
  }
  _fn(items)

  return linkItems
}

export function setItemStateProp<K extends keyof ISideNavItemState>(item: ISideNavItem, prop: K, value: ISideNavItemState[K]): void {
  if (hasProperty(item, '__state')) {
    item.__state[prop] = value
  }
}

export function getItemStateProp<K extends keyof ISideNavItemState>(item: ISideNavItem, prop: K): ISideNavItemState[K] {
  return setDefaultState(item).__state[prop]
}

export function setDefaultState(item: ISideNavItem): ISideNavItem & Required<SideNavItemCanHaveState> {
  if (hasProperty(item, '__state')) {
    return item
  }

  item.__state = {
    active: false,
    expanded: false
  }

  // TODO: See if there is a nice way to fix the typing for this.
  return item as any
}
