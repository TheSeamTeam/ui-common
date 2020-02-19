import { TableColumn } from '@marklb/ngx-datatable'

import { TableCellTypeColumn } from '../../table-cell-types/table-cell-type-column'
import { TableCellTypeConfig } from '../../table-cell-types/table-cell-type-config'
import { TableCellTypeExportProps } from '../../table-cell-types/table-cell-type-export-props'
import { TableCellTypeName } from '../../table-cell-types/table-cell-type-name'

export interface TheSeamDatatableColumnHidable {

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

export type TheSeamDatatableColumn<T extends TableCellTypeName = any, C extends TableCellTypeConfig<T> = any> =
  TableColumn &
  TableCellTypeColumn<T, C> &
  TableCellTypeExportProps &
  TheSeamDatatableColumnHidable
