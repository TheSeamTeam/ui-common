import { TableCellTypeConfig } from '../table-cell-type-config'

export interface TableCellTypeConfigDate extends TableCellTypeConfig<'date'> {

  /**
   * Date format.
   *
   * Default: 'MM-dd-yyyy h:mm aaa'
   */
  format?: string

}
