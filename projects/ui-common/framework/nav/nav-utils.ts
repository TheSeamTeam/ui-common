import { hasProperty, isNullOrUndefined } from '@theseam/ui-common/utils'

import {
  INavBasic,
  INavButton,
  INavDivider,
  INavItem,
  INavItemState,
  INavLink,
  INavTitle,
  NavItemCanHaveChildren,
  NavItemCanHaveState
} from './nav.models'

export function isHorizontalNavItemType(item: INavItem, type: 'title'): item is INavTitle
export function isHorizontalNavItemType(item: INavItem, type: 'divider'): item is INavDivider
export function isHorizontalNavItemType(item: INavItem, type: 'basic'): item is INavBasic
export function isHorizontalNavItemType(item: INavItem, type: 'link'): item is INavLink
export function isHorizontalNavItemType(item: INavItem, type: 'button'): item is INavButton
export function isHorizontalNavItemType(item: INavItem, type: string): item is INavItem {
  return item.itemType === type
}

export function isHorizontalNavItemActive(item: INavItem): boolean {
  return item.__state?.active ?? false
}

export function isHorizontalNavItemExpanded(item: INavItem): boolean {
  return item.__state?.expanded ?? false
}

export function horizontalNavItemHasChildren(item: INavItem): item is (INavBasic | INavLink) & Required<NavItemCanHaveChildren> {
  return horizontalNavItemCanHaveChildren(item) && hasProperty(item, 'children') && item.children.length > 0
}

export function horizontalNavItemCanHaveChildren(item: INavItem): item is (INavBasic | INavLink) {
  return isHorizontalNavItemType(item, 'basic') || isHorizontalNavItemType(item, 'link')
}

export function horizontalNavItemHasActiveChild(item: INavItem): boolean {
  if (!horizontalNavItemHasChildren(item)) {
    return false
  }

  for (const child of item.children) {
    if (getHorizontalNavItemStateProp(child, 'active') || horizontalNavItemHasActiveChild(child)) {
      return true
    }
  }

  return false
}

export function horizontalNavItemHasExpandedChild(item: INavItem): boolean {
  if (!horizontalNavItemHasChildren(item)) {
    return false
  }

  for (const child of item.children) {
    if (getHorizontalNavItemStateProp(child, 'expanded')) {
      return true
    }
  }

  return false
}

export function horizontalNavItemCanBeActive(item: INavItem): item is (INavBasic | INavLink) {
  return isHorizontalNavItemType(item, 'basic') || isHorizontalNavItemType(item, 'link')
}

export function horizontalNavItemCanExpand(item: INavItem): item is (INavBasic | INavLink) {
  return horizontalNavItemCanHaveChildren(item)
}

export function findHorizontalNavLinkItems(items: INavItem[]): INavLink[] {
  const linkItems: INavLink[] = []

  const _fn = (_items: INavItem[]) => {
    for (const item of _items) {
      if (isHorizontalNavItemType(item, 'link')) {
        linkItems.push(item)
      }
      if (horizontalNavItemCanHaveChildren(item) && hasProperty(item, 'children')) {
        _fn(item.children)
      }
    }
  }
  _fn(items)

  return linkItems
}

export function setHorizontalNavItemStateProp<K extends keyof INavItemState>(item: INavItem, prop: K, value: INavItemState[K]): void {
  if (hasProperty(item, '__state')) {
    item.__state[prop] = value
  }
}

export function getHorizontalNavItemStateProp<K extends keyof INavItemState>(item: INavItem, prop: K): INavItemState[K] {
  return setDefaultHorizontalNavItemState(item).__state[prop]
}

export function setDefaultHorizontalNavItemState(item: INavItem): INavItem & Required<NavItemCanHaveState> {
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

export function areSameHorizontalNavItem(item1: INavItem | undefined, item2: INavItem | undefined): boolean {
  if (isNullOrUndefined(item1) || isNullOrUndefined(item2)) {
    return false
  }

  if (item1.itemType !== item2.itemType) {
    return false
  }

  if (isHorizontalNavItemType(item1, 'title') && isHorizontalNavItemType(item2, 'title')) {
    return item1.label === item2.label
  } else if (isHorizontalNavItemType(item1, 'divider') && isHorizontalNavItemType(item2, 'divider')) {
    return item1.label === item2.label
  } else if (isHorizontalNavItemType(item1, 'basic') && isHorizontalNavItemType(item2, 'basic')) {
    return item1.label === item2.label
  } else if (isHorizontalNavItemType(item1, 'link') && isHorizontalNavItemType(item2, 'link')) {
    return item1.label === item2.label && item1.link === item2.link
  } else if (isHorizontalNavItemType(item1, 'button') && isHorizontalNavItemType(item2, 'button')) {
    return item1.onClick === item2.onClick
  }

  return false
}
