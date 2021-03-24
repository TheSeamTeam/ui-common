import { TableCellTypeName } from './table-cell-type-name'

export interface TableCellTypeConfig<T extends TableCellTypeName> {
  type: T

  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: string | string[]

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: string | string[]
}
