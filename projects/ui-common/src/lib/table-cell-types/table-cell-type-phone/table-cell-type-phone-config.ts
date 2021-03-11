import { DynamicValue } from '@lib/ui-common/dynamic'
import type { TheSeamNumberFormatsInput } from '@lib/ui-common/tel-input'

import { TableCellTypeConfig } from '../../table-cell-types/table-cell-type-config'

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
