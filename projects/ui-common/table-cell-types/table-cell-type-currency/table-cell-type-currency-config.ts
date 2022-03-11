import { DynamicActionLinkDef, DynamicActionModalDef, DynamicValue } from '@theseam/ui-common/dynamic'
import { TableCellTypeConfig } from '@theseam/ui-common/table-cell-type'

export type TableCellTypeCurrencyConfigAction =
  DynamicActionLinkDef |
  DynamicActionModalDef

export interface TableCellTypeConfigCurrency extends TableCellTypeConfig<'currency'> {
  action?: TableCellTypeCurrencyConfigAction

  /**
   * Element title attribute.
   */
  titleAttr?: DynamicValue<string>

  /**
   * A locale code for the locale format rules to use. Defaults to `en-US`.
   */
  locale?: DynamicValue<string>

  /**
   * A string containing the currency symbol or its name, such as "$" or "Canadian Dollar".
   * Used in output string, but does not affect the operation of the function.
   * Defaults to '$'
   */
  currency?: DynamicValue<string>

  /**
   * The [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code. Defaults to `USD`.
   */
  currencyCode?: DynamicValue<string>

  /**
   * When true, an empty or unparseable value defaults to an empty string, otherwise defaults to 0. Default is `true`.
   */
  defaultToEmpty?: DynamicValue<boolean>

  /**
   * The minimum number of integer digits before the decimal point. Default is 1.
   */
  minIntegerDigits?: DynamicValue<number>

  /**
   * The minimum number of digits after the decimal point. Default is 2.
   */
  minFractionDigits?: DynamicValue<number>

  /**
   * The maximum number of digits after the decimal point. Default is 2.
   */
  maxFractionDigits?: DynamicValue<number>

  /**
   * Default is 'right'.
   */
  textAlign?: DynamicValue<'left' | 'center' | 'right'>
}
