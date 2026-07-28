import { DynamicValue } from '@theseam/ui-common/dynamic'

export interface DataboardCardDataProp {
  /**
   * Matches object key on each of the provided cards.
   */
  prop: string

  /**
   * Column header in export.
   */
  name?: string

  /**
   * Transform function for column value in export.
   */
  exportValue?: DynamicValue<string>
}
