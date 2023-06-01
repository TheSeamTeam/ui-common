import { DynamicValue, DynamicValueBaseType } from '@theseam/ui-common/dynamic'

export interface DynamicDatatableMenuBarItem<C extends DynamicValueBaseType = any> {
  /**
   * Styles added to the root cell elements `style` attribute.
   */
  // styles?: DynamicValue<string | string[]>

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  // cssClass?: DynamicValue<string | string[]>

  component: DynamicValue<string>

  data?: DynamicValue<C>
}

export interface DynamicDatatableMenuBarColumn {
  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: DynamicValue<string | string[]>

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: DynamicValue<string | string[]>

  items: DynamicDatatableMenuBarItem[]
}

export interface DynamicDatatableMenuBarRowLayout<T extends string> {
  type: T
}

/**
 * Tri column tries layout the content with the center column aligned with the
 * center of the menu bar, only considering the left and right columns content
 * when width would cause them to overlap.
 *
 * If the center column is undefined, then the left column should fill the
 * remaining space to the left of the right column.
 */
export interface DynamicDatatableMenuBarRowLayoutTriColumn extends DynamicDatatableMenuBarRowLayout<'tri-column'> {
  columnLeft?: DynamicDatatableMenuBarColumn
  columnCenter?: DynamicDatatableMenuBarColumn
  columnRight?: DynamicDatatableMenuBarColumn
}

export interface DynamicDatatableMenuBarRow {
  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: DynamicValue<string | string[]>

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: DynamicValue<string | string[]>

  /**
   * In a situation where the datatable has to many rows and needs to start
   * removing rows, or moving them to an overflow drawer, the priority will be
   * used to decide which rows stay.
   *
   * When choosing rows the highest priority will be chosen first. If a value is
   * not provided, then the priority will be considered lowest. Rows that have
   * the same priority will be ordered from lowest to highest array index
   * position.
   */
  priority?: DynamicValue<number>

  layout: DynamicDatatableMenuBarRowLayoutTriColumn
}

export interface DynamicDatatableMenuBar {
  rows: DynamicDatatableMenuBarRow[]
}
