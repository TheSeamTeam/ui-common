import { IsActiveMatchOptions, UrlCreationOptions } from '@angular/router'
import { SeamIcon } from '@theseam/ui-common/icon'
import type { ThemeTypes } from '@theseam/ui-common/models'

import { SideNavItemBadgeTooltip } from './side-nav-item/side-nav-item.component'

export interface ISideNavItemState {
  // parent?: ISideNavItem
  active: boolean
  expanded: boolean
}

export interface SideNavItemCanHaveState {
  /**
   * This prop is managed by the SideNav. If manually set it will be overwritten.
   *
   * @ignore
   */
   __state?: ISideNavItemState
}

export interface SideNavItemCanBeActive {
  /**
   * Can navigate, when active.
   *
   * Enable if you need to receive events when the item is already active, such
   * as observing `NavigationSkipped` router events.
   *
   * Default: false
   */
  activeNavigatable?: boolean
}

export interface SideNavItemCanHaveChildren {
  children?: ISideNavItem[]
}

export interface ISideNavItemBase<T extends string> extends SideNavItemCanHaveState {
  /**
   * default: 'route'
   */
  itemType?: T

  badge?: ISideNavBadge
}

export interface ISideNavTitle extends ISideNavItemBase<'title'> {
  label?: string
}

export interface ISideNavDivider extends ISideNavItemBase<'divider'> {
  label?: string
}

export interface ISideNavBadge {

  text?: string

  theme?: ThemeTypes

  /**
   * Content to provide to assistive technology, such as screen readers.
   */
  srContent?: string

  tooltip?: string | SideNavItemBadgeTooltip
}

export interface ISideNavBasic extends ISideNavItemBase<'basic'>, SideNavItemCanHaveChildren {
  icon?: SeamIcon
  label: string
}

export interface ISideNavLink extends ISideNavItemBase<'link'>,
  Partial<Pick<UrlCreationOptions, 'queryParams' | 'fragment' | 'queryParamsHandling' | 'preserveFragment'>>,
  SideNavItemCanHaveChildren,
  SideNavItemCanBeActive {
  icon?: SeamIcon
  label: string

  link?: any[] | string

  /**
   * Default: { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }
   */
  matchOptions?: Partial<IsActiveMatchOptions>
}

export interface ISideNavButton extends ISideNavItemBase<'button'>, SideNavItemCanBeActive {
  onClick: (event: MouseEvent) => void
}

export type ISideNavItem = ISideNavTitle | ISideNavDivider | ISideNavBasic | ISideNavLink | ISideNavButton

export interface SideNavItemStateChanged {
  item: ISideNavItem
  prop: string
  prevValue: any
  newValue: any
}

/**
 * When `never`, menu item tooltip is always disabled.
 * When `always`, menu item tooltip is always enabled.
 * When `collapseOnly`, menu item tooltip is enabled only when the sidenav is collapsed.
 */
export type SideNavItemMenuItemTooltipBehavior = 'never' | 'always' | 'collapseOnly'

export interface SideNavItemMenuItemTooltipConfig {
  class?: string
  placement?: string
  container?: string
  behavior?: SideNavItemMenuItemTooltipBehavior
}
