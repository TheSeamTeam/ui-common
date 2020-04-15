import { DynamicValue } from '../../dynamic/models/dynamic-value'
import { TableCellTypeConfig } from '../table-cell-type-config'

export interface TableCellTypeConfigProgressCircle extends TableCellTypeConfig<'progress-circle'> {

  /**
   * Progress circle.
   *
   */
  fillBackground: boolean

  showText: boolean

  hiddenOnEmpty: boolean

  total: number

  numComplete: number

  tooltip: DynamicValue<string>

  tooltipClass: string

  tooltipPlacement: string

  tooltipContainer: string

}
