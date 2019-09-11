import { LibIcon } from '../../icon/index'

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

export interface ISideNavDivider extends ISideNavItemBase<'divider'> {
  label?: string
}

export interface ISideNavBasic extends ISideNavItemBase<'basic'> {
  icon?: LibIcon
  label: string

  children?: ISideNavItem[]
}

export interface ISideNavLink extends ISideNavItemBase<'link'> {
  icon?: LibIcon
  label: string

  link?: any[]|string
  queryParams?: { [k: string]: any }

  children?: ISideNavItem[]
}

export interface ISideNavButton extends ISideNavItemBase<'button'> {
  onClick: (event) => void
}

export type ISideNavItem = ISideNavDivider | ISideNavBasic | ISideNavLink | ISideNavButton
