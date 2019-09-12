import { ThemeTypes } from '../models/index'

export type IDynamicDatatableCellType = 'string' | 'integer' | 'decimal'
  | 'date' | 'icon' | 'url'

export interface IDynamicDatatableColumn {
  prop: string
  cellType: IDynamicDatatableCellType
}

export interface IDynamicDatatableRow {
  [prop: string]: any
}

export interface IDynamicDatatableFilterDef {
  name: string
  position?: string
  options?: any
}

export interface IDynamicDatatableFilterMenu {
  /**
   * Default: false
   */
  hidden: boolean
  items: IDynamicDatatableFilterDef[]
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

export interface IDynamicDatatableFooterMenu {
  /**
   * Default: false
   */
  hidden: boolean
  items: IDynamicDatatableFooterMenuItem[]
}

export interface IDatatableDynamicDef {
  filters?: IDynamicDatatableFilterMenu
  columns: IDynamicDatatableColumn[]
  rows: IDynamicDatatableRow[]
  footerMenu?: IDynamicDatatableFooterMenu
}
