import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'

export interface TableCellTypeConfigDate extends TableCellTypeConfig<'date'> {

  /**
   * Date format.
   *
   * Default: 'yyyy-MM-dd h:mm aaa'
   */
  format?: string

}
