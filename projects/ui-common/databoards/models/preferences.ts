import { TheSeamPreferencesBase } from '@theseam/ui-common/services'

import { BoardsAlterationState } from './board-alteration'

export interface TheSeamDataboardListPreferencesColumn {
  prop: string
  width?: number
  canAutoResize?: boolean
  hidden?: boolean
}

export interface TheSeamDataboardListPreferences extends TheSeamPreferencesBase {
  version: 1
  alterations: BoardsAlterationState[]
}

export const CURRENT_DATABOARD_LIST_PREFERENCES_VERSION = 1

export const EMPTY_DATABOARD_LIST_PREFERENCES: TheSeamDataboardListPreferences = {
  version: 1,
  alterations: []
}
