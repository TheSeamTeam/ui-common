import { DynamicValue } from '../../dynamic/models/dynamic-value'
import { TableCellTypeConfig } from '../table-cell-type-config'

export interface TableCellTypeConfigProgressCircle extends TableCellTypeConfig<'progress-circle'> {

  /**
   * Progress circle.
   *
   */
  fillBackground?: DynamicValue<boolean>

  showText?: DynamicValue<boolean>

  hiddenOnEmpty?: DynamicValue<boolean>

  pending?: DynamicValue<boolean>

  tooltip?: DynamicValue<string>

  tooltipClass?: DynamicValue<string>

  tooltipPlacement?: DynamicValue<string>

  tooltipContainer?: DynamicValue<string>

}
