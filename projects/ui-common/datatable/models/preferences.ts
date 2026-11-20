import { TheSeamPreferencesBase } from '@theseam/ui-common/services'

import { ColumnsAlterationState } from './columns-alteration'

export interface TheSeamDatatablePreferencesColumn {
  prop: string
  width?: number
  canAutoResize?: boolean
  hidden?: boolean
}

export interface TheSeamDatatablePreferences_v1 {
  columns?: TheSeamDatatablePreferencesColumn[]
}

/**
 * Table-wide display choices the user made. These are not column alterations,
 * so resetting the columns does not reset them.
 */
export interface TheSeamDatatablePreferencesDisplay {
  /**
   * Only applied when `allowUserAutoHeaderHeight` is enabled in
   * `TheSeamDatatableConfig`.
   */
  headerHeight?: 'auto'
}

export interface TheSeamDatatablePreferences_v2 extends TheSeamPreferencesBase {
  version: 2
  alterations: ColumnsAlterationState[]
  display?: TheSeamDatatablePreferencesDisplay
}

export type TheSeamDatatablePreferences = TheSeamDatatablePreferences_v2

export const CURRENT_DATATABLE_PREFERENCES_VERSION = 2

export const EMPTY_DATATABLE_PREFERENCES: TheSeamDatatablePreferences = {
  version: 2,
  alterations: [],
}
