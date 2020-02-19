import { ComponentType } from '@angular/cdk/portal'

import { DynamicValue } from '../../dynamic/models/dynamic-value'

export interface DynamicDatatableMenuBarItem<C = any> {

  position: 'left' | 'center' | 'right'

  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: DynamicValue<string | string[]>

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: DynamicValue<string | string[]>

  component?: DynamicValue<string | ComponentType<{}>>

  config?: C
}

export interface DynamicDatatableMenuBarRow {
  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: DynamicValue<string | string[]>

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: DynamicValue<string | string[]>

  items: DynamicDatatableMenuBarItem[]
}

export interface DynamicDatatableMenuBar {
  rows: DynamicDatatableMenuBarRow
}
