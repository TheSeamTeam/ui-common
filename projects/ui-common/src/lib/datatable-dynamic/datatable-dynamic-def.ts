import { DynamicValue, IDynamicActionDef } from '../dynamic/index'
import { ThemeTypes } from '../models/index'

import { IDynamicDatatableCellType } from './models/cell-type'
import { DynamicDatatableCellTypeConfig } from './models/cell-type-config'
import { IDynamicDatatableRowAction } from './models/dynamic-datatable-row-action'
// import {
//   DynamicDatatableRowActionApi,
//   DynamicDatatableRowActionLink,
//   DynamicDatatableRowActionModal
// } from './models/row-action'

export interface IDynamicDatatableColumn<T = IDynamicDatatableCellType> {
  prop: string
  name: string
  /**
   * Default: 'string'
   */
  cellType?: T
  /**
   * Config passed to the cell type component.
   */
  cellTypeConfig?: DynamicDatatableCellTypeConfig<T>
  /**
   * String to display if the exporter uses a header.
   */
  exportHeader?: string
  /**
   * Expression to calculate export value.
   * TODO: Implement. Jexl is most likely going to be used.
   */
  exportExpr?: string
}

export interface IDynamicDatatableRow {
  [prop: string]: any
}

export interface IDynamicDatatableFilterMenuItemDef<O = any> {

  /** */
  name: string

  /**
   * TODO: Refactor filter menu items to use locations instead of trying to
   * maintain a mix of generic and specific types.
   *
   * Default: 'common'
   */
  type: 'common' | 'full-search'

  /**
   * Default: 0
   */
  order?: number

  /** */
  options?: O
}

export interface IDynamicDatatableFilterMenu {

  /**
   * Default 'default'
   */
  state?: 'hidden' | 'always-visible' | 'default'

  /**
   *
   */
  filters?: IDynamicDatatableFilterMenuItemDef[]

  /**
   *
   * Example: [ 'exporter:csv', 'exporter:xlsx' ]
   */
  exporters?: string[]

}

export type IDynamicDatatableFooterMenuItemType = 'button' | 'text'

export interface IDynamicDatatableFooterMenuItem<T = IDynamicDatatableFooterMenuItemType> {
  type: T
}

export interface IDynamicDatatableFooterMenuItemButton extends IDynamicDatatableFooterMenuItem<'button'> {
  text: string
  theme: ThemeTypes
}

export interface IDynamicDatatableFooterMenuItemText extends IDynamicDatatableFooterMenuItem<'text'> {
  text: string
}

export interface IDynamicDatatableOptions {
  /**
   * Default: false
   */
  virtualization?: boolean
}

export interface IDynamicDatatableFooterMenu {
  /**
   * Default 'default'
   */
  state?: 'hidden' | 'always-visible' | 'default'
  items?: IDynamicDatatableFooterMenuItem[]
}

// TODO: Replace with new implementation.
// export type DynamicDatatableRowActionType =
//   DynamicDatatableRowActionLink
//   | DynamicDatatableRowActionApi
//   | DynamicDatatableRowActionModal

// export interface IDynamicDatatableRowActionDef {

//   /**
//    * Label displayed on the menu item.
//    */
//   label: string

//   /**
//    * TODO: Decide on a good way to handle the actions configuration through json.
//    */
//   action?: IDynamicActionDef

//   /**
//    * Expression executed each row to decide if the action will be visible.
//    */
//   hidden?: DynamicValue

// }

export interface IDatatableDynamicDef {
  filterMenu?: IDynamicDatatableFilterMenu
  columns: IDynamicDatatableColumn[]
  rows: IDynamicDatatableRow[]
  // rowActions?: IDynamicDatatableRowActionDef[]
  rowActions?: IDynamicDatatableRowAction[]
  // footerMenu?: IDynamicDatatableFooterMenu
  options?: IDynamicDatatableOptions
}
