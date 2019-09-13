import { ThemeTypes } from '../models/index'

export type IDynamicDatatableCellType = 'string' | 'integer' | 'decimal'
  | 'date' | 'icon' | 'url'

export interface IDynamicDatatableColumn {
  prop: string
  name: string
  /**
   * Default: 'string'
   */
  cellType?: IDynamicDatatableCellType
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

export interface IDynamicDatatableFilterDef<O = any> {
  name: string
  /**
   * Default: 'common'
   */
  type?: 'common' | 'full-search'
  /**
   * Default: 0
   */
  order?: number
  options?: O
}

export interface IDynamicDatatableFilterMenu {
  /**
   * Default 'default'
   */
  state?: 'hidden' | 'always-visible' | 'default'
  filters?: IDynamicDatatableFilterDef[]
  exporters?: IDynamicDatatableExporter[]
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
   * Default: false
   */
  hidden: boolean
  items: IDynamicDatatableFooterMenuItem[]
}

export interface IDynamicDatatableRowActionDef {
  /**
   * Label displayed on the menu item.
   */
  label: string
  /**
   * TODO: Decide on a good way to handle the actions configuration through json.
   */
  // action:
  /**
   * Expression executed each row to decide if the action will be visible.
   */
  // isHiddenExpr?: string
}

// TODO: Define object definition to allow extra exporter options.
export type IDynamicDatatableExporter = 'exporter:csv' | 'exporter:xlsx'

export interface IDatatableDynamicDef {
  filterMenu?: IDynamicDatatableFilterMenu
  columns: IDynamicDatatableColumn[]
  rows: IDynamicDatatableRow[]
  rowActions?: IDynamicDatatableRowActionDef[]
  footerMenu?: IDynamicDatatableFooterMenu
  options?: IDynamicDatatableOptions
}
