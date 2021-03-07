import { DynamicValue } from '@lib/ui-common/dynamic'
import { TableCellTypeConfig } from '../../table-cell-types/table-cell-type-config'
import type { TheSeamNumberFormatsInput } from '../../tel-input'

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
