import { SeamIcon } from '../../icon/index'
import type { ThemeTypes } from '../../models'

export interface ISideNavItemStatus {
  active: boolean
}

export interface ISideNavItemBase<T extends string> {
  /**
   * default: 'route'
   */
  itemType?: T

  /** This prop is set by the nav bar. If manually set it may be overwritten. */
  status?: ISideNavItemStatus
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
}

export interface ISideNavBasic extends ISideNavItemBase<'basic'> {
  icon?: SeamIcon
  label: string

  badge?: ISideNavBadge

  children?: ISideNavItem[]
}

export interface ISideNavLink extends ISideNavItemBase<'link'> {
  icon?: SeamIcon
  label: string

  badge?: ISideNavBadge

  link?: any[]|string
  queryParams?: { [k: string]: any }

  children?: ISideNavItem[]
}

export interface ISideNavButton extends ISideNavItemBase<'button'> {
  onClick: (event) => void
}

export type ISideNavItem = ISideNavTitle | ISideNavDivider | ISideNavBasic | ISideNavLink | ISideNavButton
