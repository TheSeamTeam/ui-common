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

export interface TheSeamDatatablePreferences_v2 {
  version: 2
  alterations: ColumnsAlterationState[]
}

export type TheSeamDatatablePreferences = TheSeamDatatablePreferences_v2

export const CURRENT_DATATABLE_PREFERENCES_VERSION = 2

export const EMPTY_DATATABLE_PREFERENCES: TheSeamDatatablePreferences = {
  version: 2,
  alterations: []
}
