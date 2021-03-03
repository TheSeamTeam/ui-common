import { TableCellTypeConfig } from '../table-cell-type-config'

export interface TableCellTypeConfigDate extends TableCellTypeConfig<'date'> {

  /**
   * Date format.
   *
   * Default: 'yyyy-MM-dd h:mm aaa'
   */
  format?: string

}
