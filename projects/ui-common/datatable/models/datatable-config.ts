import { InjectionToken } from "@angular/core";
import { SeamIcon } from "@theseam/ui-common/icon";

export interface TheSeamDatatableMessages {
  /**
   * Message to show when array is presented, but contains no values.
   *
   * @default 'No records found'
   */
  emptyMessage: string

  /**
   * Footer total message.
   *
   * @default 'total'
   */
  totalMessage: string

  /**
   * Footer selected message.
   *
   * @default 'selected'
   */
  selectedMessage: string
}

export type TheSeamDatatableColumnFilterUpdateMethod = 'valueChanges' | 'submit'

/**
 * A config object that can be injected at the top level of a project
 * to apply specific TheSeamDatatable settings site-wide.
 */
export interface TheSeamDatatableConfig {

  /**
   * See `TheSeamDatatableMessages`.
   */
  messages?: Partial<TheSeamDatatableMessages> | undefined | null

  /**
   * Minimum header height in pixels.
   *
   * @default 50
   */
  headerHeight?: number | undefined | null

  /**
   * Row height in pixels, necessary for calculating scroll height.
   *
   * @default 50
   */
  rowHeight?: number | undefined | null

  /**
   * Minimum footer height in pixels.
   *
   * @default 40
   */
  footerHeight?: number | undefined | null

  /**
   * CSS classes for various icon buttons.
   *
   * @default
   *   sortAscending: 'datatable-icon-up',
   *   sortDescending: 'datatable-icon-down',
   *   pagerLeftArrow: 'datatable-icon-left',
   *   pagerRightArrow: 'datatable-icon-right',
   *   pagerPrevious: 'datatable-icon-prev',
   *   pagerNext: 'datatable-icon-skip'
   */
  cssClasses?: { [key: string]: string }

  /**
   * Icon to display to the left of the column header
   * when a column is marked "filterable".
   *
   * @default faFilter
   */
  columnFilterIcon?: SeamIcon

  /**
   * Determines what kind of action causes a filter column to be applied.
   *
   * `valueChanges`: Filter is applied on form `valueChanges` event, with an optional debounce set on `columnFilterUpdateDebounce`.
   *
   * `submit`: Filter is applied on form submit. No debounce is applied.
   *
   * @default "valueChanges"
   */
  columnFilterUpdateMethod?: TheSeamDatatableColumnFilterUpdateMethod

  /**
   * Number of milliseconds to debounce a filter form input before applying the filter change.
   * Only applicable when `columnFilterUpdateMethod` is `valueChanges`.
   *
   * @default 400
   */
  columnFilterUpdateDebounce?: number
}

export const THESEAM_DATATABLE_CONFIG = new InjectionToken<TheSeamDatatableConfig>('TheSeamDatatableConfig')
