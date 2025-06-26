import { TableColumn } from '@marklb/ngx-datatable'

import { TableCellTypeColumn, TableCellTypeConfig, TableCellTypeExportProps, TableCellTypeName } from '@theseam/ui-common/table-cell-type'

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

export interface TheSeamDatatableColumnFilterable<T extends TheSeamDatatableColumnFilterableConfig = any> {
  filterable?: boolean

  /**
   * Additional options for a specific filter type.
   */
  filterOptions?: T
}

export interface TheSeamDatatableColumnFilterableConfig {
  /**
   * The object name on which to run the filter.
   *
   * Defaults to column prop.
   */
  filterProp?: string

  /**
   * The type of filter(s) to show in the filter menu.
   *
   * If not provided, will look to cellType to determine default filter(s).
   */
  filterType?: string

}

export type TheSeamDatatableColumn<T extends TableCellTypeName = any, C extends TableCellTypeConfig<T> = any, F extends TheSeamDatatableColumnFilterableConfig = any> =
  TableColumn &
  TableCellTypeColumn<T, C> &
  TableCellTypeExportProps &
  TheSeamDatatableColumnHidable &
  TheSeamDatatableColumnFilterable<F>
