import { isDevMode } from '@angular/core'

import { ColumnsAlteration, ColumnsAlterationState } from '../models/columns-alteration'
import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { WidthColumnsAlteration } from '../models/columns-alterations/width.columns-alteration';

export function mapColumnsAlterationsStates(states: ColumnsAlterationState[]): ColumnsAlteration[] {
  const alterations: ColumnsAlteration[] = []

  for (const state of states) {
    try {
      switch (state.type) {
        case 'hide-column': alterations.push(new HideColumnColumnsAlteration(state.state, true)); break;
        case 'width': alterations.push(new WidthColumnsAlteration(state.state, true)); break;
        default: {
          if (isDevMode()) {
            console.warn('Unrecognized columns alteration state', state)
          }
        }
      }
    } catch (e) {
      if (isDevMode()) {
        console.warn('Unable to map columns alteration state', state)
        console.warn(e)
      }
    }
  }

  return alterations
}
