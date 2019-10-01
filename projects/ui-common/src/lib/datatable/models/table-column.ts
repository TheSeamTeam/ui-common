import { TableColumn } from '@marklb/ngx-datatable'

export type TheSeamTableColumnExportValueFn<D = any> = (row: D) => string

export type TheSeamTableCellType = 'date' | 'icon'

export interface ITheSeamTableColumn<D = any, P = any> extends TableColumn {

  /**
   * If undefined the value will be rendered as a string.
   */
  cellType?: TheSeamTableCellType

  /**
   * Properties to pass to the cell component.
   */
  cellProps?: P

  /**
   * Ignore column in export.
   */
  exportIgnore?: boolean

  /**
   * Column header in export.
   */
  exportHeader?: string

  /**
   * Transform function for column value in export.
   */
  exportValueFn?: TheSeamTableColumnExportValueFn<D>

}
