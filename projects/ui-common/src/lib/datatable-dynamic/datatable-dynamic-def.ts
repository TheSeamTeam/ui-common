import { PipeTransform } from '@angular/core'
import { TableColumnProp } from '@marklb/ngx-datatable'

import { DynamicValue } from '../dynamic/index'
import { ThemeTypes } from '../models/index'

import { TheSeamDatatableColumn } from '../datatable/models/table-column'
import { TableCellTypeConfig } from '../table-cell-types/table-cell-type-config'
import { TableCellTypeName } from '../table-cell-types/table-cell-type-name'
import { TheSeamTableColumn } from '../table/table-column'

import { DynamicDatatableRowAction } from './models/dynamic-datatable-row-action'

export type DynamicDatatableColumn<T extends TableCellTypeName, C extends TableCellTypeConfig<T>> =
  TheSeamDatatableColumn<T, C> | TheSeamTableColumn<T, C>

// export interface DynamicDatatableColumn<T extends DynamicDatatableCellType, C extends DynamicDatatableCellTypeConfig<T>> {
//   /**
//    * Default: 'string'
//    */
//   cellType?: T
//   /**
//    * Config passed to the cell type component.
//    */
//   cellTypeConfig?: C
//   /**
//    * String to display if the exporter uses a header.
//    */
//   exportHeader?: string
//   /**
//    * Expression to calculate export value.
//    * TODO: Implement. Jexl is most likely going to be used.
//    * @deprecated
//    */
//   exportExpr?: string
//   /**
//    * Value or DynamicValue object to calculate export value.
//    * TODO: Implement.
//    */
//   exportValue?: DynamicValue<string>

//   /**
//    * Determines if column is checkbox
//    */
//   checkboxable?: boolean
//   /**
//    * Determines if the column is frozen to the left
//    */
//   frozenLeft?: boolean
//   /**
//    * Determines if the column is frozen to the right
//    */
//   frozenRight?: boolean
//   /**
//    * The grow factor relative to other columns. Same as the flex-grow
//    * API from http =//www.w3.org/TR/css3-flexbox/. Basically;
//    * take any available extra width and distribute it proportionally
//    * according to all columns' flexGrow values.
//    */
//   flexGrow?: number
//   /**
//    * Min width of the column
//    */
//   minWidth?: number
//   /**
//    * Max width of the column
//    */
//   maxWidth?: number
//   /**
//    * The default width of the column, in pixels
//    */
//   width?: number
//   /**
//    * Can the column be resized
//    */
//   resizeable?: boolean
//   /**
//    * Custom sort comparator
//    *
//    * NOTE: Not supported in JSON format
//    */
//   comparator?: any
//   /**
//    * Custom pipe transforms
//    *
//    * NOTE: Not supported in JSON format
//    */
//   pipe?: PipeTransform
//   /**
//    * Can the column be sorted
//    */
//   sortable?: boolean
//   /**
//    * Can the column be re-arranged by dragging
//    */
//   draggable?: boolean
//   /**
//    * Whether the column can automatically resize to fill space in the table.
//    */
//   canAutoResize?: boolean
//   /**
//    * Column name or label
//    */
//   name?: string
//   /**
//    * Property to bind to the row. Example:
//    *
//    * `someField` or `some.field.nested`, 0 (numeric)
//    *
//    * If left blank, will use the name as camel case conversion
//    */
//   prop?: TableColumnProp
//   /**
//    * Cell template ref
//    *
//    * NOTE: Not supported in JSON format
//    */
//   cellTemplate?: any
//   /**
//    * Header template ref
//    *
//    * NOTE: Not supported in JSON format
//    */
//   headerTemplate?: any
//   /**
//    * Tree toggle template ref
//    *
//    * NOTE: Not supported in JSON format
//    */
//   treeToggleTemplate?: any
//   /**
//    * CSS Classes for the cell
//    *
//    * NOTE: `Function` type not supported in JSON format
//    */
//   cellClass?: string | ((data: any) => string | any)
//   /**
//    * CSS classes for the header
//    *
//    *
//    * NOTE: `Function` type not supported in JSON format
//    */
//   headerClass?: string | ((data: any) => string | any)
//   /**
//    * Header checkbox enabled
//    */
//   headerCheckboxable?: boolean
//   /**
//    * Is tree displayed on this column
//    */
//   isTreeColumn?: boolean
//   /**
//    * Width of the tree level indent
//    */
//   treeLevelIndent?: number
//   /**
//    * Summary function
//    *
//    * NOTE: Not supported in JSON format
//    */
//   summaryFunc?: (cells: any[]) => any
//   /**
//    * Summary cell template ref
//    *
//    * NOTE: Not supported in JSON format
//    */
//   summaryTemplate?: any
// }

// // export type DynamicDatatableColumnType =
// //   DynamicDatatableColumn<'string', DynamicDatatableCellTypeConfigString> |
// //   DynamicDatatableColumn<'integer', DynamicDatatableCellTypeConfigInteger> |
// //   DynamicDatatableColumn<'decimal', DynamicDatatableCellTypeConfigDecimal> |
// //   DynamicDatatableColumn<'date', DynamicDatatableCellTypeConfigDate> |
// //   DynamicDatatableColumn<'icon', DynamicDatatableCellTypeConfigIcon>

export interface DynamicDatatableRow {
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

export interface IDatatableDynamicDef {
  readonly filterMenu?: IDynamicDatatableFilterMenu
  readonly columns: DynamicDatatableColumn<TableCellTypeName, TableCellTypeConfig<TableCellTypeName>>[]
  readonly rows: IDynamicDatatableRow[]
  readonly rowActions?: DynamicDatatableRowAction[]
  // footerMenu?: IDynamicDatatableFooterMenu
  readonly options?: IDynamicDatatableOptions
}
