import { FocusOrigin } from '@angular/cdk/a11y'
import { Direction } from '@angular/cdk/bidi'
import { EventEmitter, TemplateRef } from '@angular/core'

import { MenuFooterComponent } from './menu-footer/menu-footer.component'
import { MenuHeaderComponent } from './menu-header/menu-header.component'

/**
 * Interface for a custom menu panel that can be used with `seamMenuToggle`.
 */
export interface ITheSeamMenuPanel<T = any> {
  templateRef: TemplateRef<any>
  closed: EventEmitter<void | 'click' | 'keydown' | 'tab'>
  parentMenu?: ITheSeamMenuPanel | undefined
  direction?: Direction
  focusFirstItem: (origin?: FocusOrigin) => void
  resetActiveItem: () => void
  addItem?: (item: T) => void
  removeItem?: (item: T) => void
  setFooter?: (footer?: MenuFooterComponent) => void
  setHeader?: (header?: MenuHeaderComponent) => void
}
