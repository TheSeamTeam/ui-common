import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@theseam/ui-common/dynamic'
import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'

export type TableCellTypeDecimalConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigDecimal extends TableCellTypeConfig<'decimal'> {
  action?: TableCellTypeDecimalConfigAction

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
   * The minimum number of integer digits before the decimal point. Default is 1.
   */
  minIntegerDigits?: DynamicValue<number>

  /**
   * The minimum number of digits after the decimal point. Default is 0.
   */
  minFractionDigits?: DynamicValue<number>

  /**
   * The maximum number of digits after the decimal point. Default is 3.
   */
  maxFractionDigits?: DynamicValue<number>

  /**
   * Default is 'right'.
   */
  textAlign?: DynamicValue<'left' | 'center' | 'right'>
}
