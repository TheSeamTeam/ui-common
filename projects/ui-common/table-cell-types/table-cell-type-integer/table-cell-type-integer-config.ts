import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@theseam/ui-common/dynamic'
import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'

export type TableCellTypeIntegerConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigInteger extends TableCellTypeConfig<'integer'> {
  action?: TableCellTypeIntegerConfigAction

  /**
   * Element title attribute.
   */
  // titleAttr?: DynamicValue<string>

  /**
   * A locale code for the locale format rules to use. Defaults to `en-US`.
   */
  locale?: DynamicValue<string>

  /**
   * When true, pipe input through Angular `number` pipe. Default is `true`.
   */
  formatNumber?: DynamicValue<boolean>

  /**
   * If `formatNumber === true`, the minimum number of integer digits before the decimal point. Default is 1.
   */
   minIntegerDigits?: DynamicValue<number>

   /**
    * Default is `right`.
    */
   textAlign?: DynamicValue<'left' | 'center' | 'right'>
}
