import { LibIcon } from '../../icon/index'

export interface ISideNavItemBase<T extends string> {
  /**
   * default: 'route'
   */
  itemType?: T
}

export interface ISideNavDivider extends ISideNavItemBase<'divider'> {
  label?: string
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

export type ISideNavItem = ISideNavDivider | ISideNavLink | ISideNavButton
