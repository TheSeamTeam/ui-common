import { IsActiveMatchOptions, UrlCreationOptions } from '@angular/router'
import { SeamIcon } from '@theseam/ui-common/icon'
import type { ThemeTypes } from '@theseam/ui-common/models'

export interface INavItemState {
  // parent?: INavItem
  active: boolean
  expanded: boolean
  focused: boolean
}

export interface NavItemCanHaveState {
  /**
   * This prop is managed by the Nav. If manually set it will be overwritten.
   *
   * @ignore
   */
   __state?: INavItemState
}

export interface NavItemCanHaveChildren {
  children?: INavItem[]
}

export interface INavItemBase<T extends string> extends NavItemCanHaveState {
  /**
   * default: 'route'
   */
  itemType?: T

  badge?: INavBadge
}

export interface INavTitle extends INavItemBase<'title'> {
  label?: string
}

export interface INavDivider extends INavItemBase<'divider'> {
  label?: string
}

export interface INavBadge {

  text?: string

  theme?: ThemeTypes

  /**
   * Content to provide to assistive technology, such as screen readers.
   */
  srContent?: string

  tooltip?: string | NavItemBadgeTooltip
}

export interface INavBasic extends INavItemBase<'basic'>, NavItemCanHaveChildren {
  icon?: SeamIcon
  label: string
}

export interface INavLink extends INavItemBase<'link'>,
  Partial<Pick<UrlCreationOptions, 'queryParams' | 'fragment' | 'queryParamsHandling' | 'preserveFragment'>>,
  NavItemCanHaveChildren {
  icon?: SeamIcon
  label: string

  link?: any[] | string

  /**
   * Default: { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }
   */
  matchOptions?: Partial<IsActiveMatchOptions>
}

export interface INavButton extends INavItemBase<'button'> {
  onClick: (event: MouseEvent) => void
}

export type INavItem = INavTitle | INavDivider | INavBasic | INavLink | INavButton

export interface NavItemStateChanged {
  item: INavItem
  prop: keyof INavItemState
  prevValue: any
  newValue: any
}

export interface NavItemBadgeTooltip {
  tooltip?: string
  class?: string
  placement?: string
  container?: string
  disabled?: boolean
}

export type NavItemChildAction = 'menu' | 'expand' | 'none' | null | undefined

export type NavItemExpandAction = 'toggle' | 'expandOnly' | null | undefined

export interface NavItemExpandedEvent {
  navItem: INavItem,
  expanded: boolean
}
