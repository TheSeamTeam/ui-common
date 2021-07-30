import { ISideNavBasic, ISideNavButton, ISideNavDivider, ISideNavItem, ISideNavLink, ISideNavTitle } from './side-nav.models'

export function isNavItemType(item: ISideNavItem, type: 'title'): item is ISideNavTitle
export function isNavItemType(item: ISideNavItem, type: 'divider'): item is ISideNavDivider
export function isNavItemType(item: ISideNavItem, type: 'basic'): item is ISideNavBasic
export function isNavItemType(item: ISideNavItem, type: 'link'): item is ISideNavLink
export function isNavItemType(item: ISideNavItem, type: 'button'): item is ISideNavButton
export function isNavItemType(item: ISideNavItem, type: string): item is ISideNavItem {
  return item.itemType === type
}
