import { DynamicValue } from '@lib/ui-common/dynamic'
import { TableCellTypeConfig } from '@lib/ui-common/table-cell-type'
import type { TheSeamNumberFormatsInput } from '@lib/ui-common/tel-input'

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
