import { DynamicValue } from '../dynamic/models/dynamic-value'

export interface TableCellTypeExportProps  {

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
  exportValue?: DynamicValue<string>

}
