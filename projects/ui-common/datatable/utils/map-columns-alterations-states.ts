import { isDevMode } from '@angular/core'

import { ColumnsAlteration, ColumnsAlterationState } from '../models/columns-alteration'
import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { OrderColumnsAlteration } from '../models/columns-alterations/order.columns-alteration';
import { WidthColumnsAlteration } from '../models/columns-alterations/width.columns-alteration';

export function mapColumnsAlterationsStates(states: ColumnsAlterationState[]): ColumnsAlteration[] {
  const alterations: ColumnsAlteration[] = []

  for (const state of states) {
    try {
      switch (state.type) {
        case 'hide-column': alterations.push(new HideColumnColumnsAlteration(state.state, true)); break;
        case 'width': alterations.push(new WidthColumnsAlteration(state.state, true)); break;
        case 'order': alterations.push(new OrderColumnsAlteration(state.state, true)); break;
        default: {
          if (isDevMode()) {
            console.warn('Unrecognized ColumnsAlteration state', state)
          }
        }
      }
    } catch (e) {
      if (isDevMode()) {
        console.warn('Unable to map ColumnsAlteration state', state)
        console.warn(e)
      }
    }
  }

  return alterations
}
