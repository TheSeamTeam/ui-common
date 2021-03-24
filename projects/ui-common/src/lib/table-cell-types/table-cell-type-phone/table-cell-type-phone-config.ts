import { DynamicValue } from '@theseam/ui-common/dynamic'
import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'
import type { TheSeamNumberFormatsInput } from '@theseam/ui-common/tel-input'

export interface TableCellTypeConfigPhone extends TableCellTypeConfig<'phone'> {

  /**
   * Element title attribute.
   */
  titleAttr?: DynamicValue<string>

  /**
   * Phone number format.
   */
  format: TheSeamNumberFormatsInput
}
