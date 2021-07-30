import { IsActiveMatchOptions, UrlCreationOptions } from '@angular/router'
import { SeamIcon } from '@theseam/ui-common/icon'
import type { ThemeTypes } from '@theseam/ui-common/models'

import { SideNavItemBadgeTooltip } from './side-nav-item/side-nav-item.component'

export interface ISideNavItemState {
  active: boolean
}

export interface ISideNavItemBase<T extends string> {
  /**
   * default: 'route'
   */
  itemType?: T

  /**
   * This prop is managed by the SideNav. If manually set it will be overwritten.
   *
   * @ignore
   */
  __state?: ISideNavItemState
}

export interface SideNavItemWithChildren {
  children?: ISideNavItem[]
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

export interface ISideNavBasic extends ISideNavItemBase<'basic'> {
  icon?: SeamIcon
  label: string

  badge?: ISideNavBadge

  children?: ISideNavItem[]
}

export interface ISideNavLink extends ISideNavItemBase<'link'>, Partial<Pick<UrlCreationOptions, 'queryParams' | 'fragment' | 'queryParamsHandling' | 'preserveFragment'>> {
  icon?: SeamIcon
  label: string

  badge?: ISideNavBadge

  link?: any[] | string

  /**
   * Default: { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }
   */
  matchOptions?: Partial<IsActiveMatchOptions>

  children?: ISideNavItem[]
}

export interface ISideNavButton extends ISideNavItemBase<'button'> {
  onClick: (event: MouseEvent) => void
}

export type ISideNavItem = ISideNavTitle | ISideNavDivider | ISideNavBasic | ISideNavLink | ISideNavButton
