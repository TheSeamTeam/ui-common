import { TableColumn } from '@marklb/ngx-datatable'

import { TheSeamTableCellType, TheSeamTableColumnExportValueFn } from '../../table/index'

export interface ITheSeamDatatableColumn<D = any, P = any> extends TableColumn {

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

  /**
   * Hide a column, but let the datatable still know about it. Useful for
   * hidding a columns that can be unhidden through a setting.
   *
   * NOTE: If you filter out the column before passing it to the datatable it
   * will not be able to provide that column as an option in the column toggle
   * list.
   */
  hidden?: boolean

}
