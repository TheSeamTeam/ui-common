import { TableCellTypeConfig } from './table-cell-type-config'
import { TableCellTypeName } from './table-cell-type-name'

export interface TableCellTypeColumn<T extends TableCellTypeName, C extends TableCellTypeConfig<T>> {

  /**
   * If undefined the value will be rendered as a string.
   */
  cellType?: T

  /**
   * Config to pass to the cell component.
   */
  cellTypeConfig?: C

}
