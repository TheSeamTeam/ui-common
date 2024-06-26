import { isDevMode } from '@angular/core'

import { ColumnsAlteration, ColumnsAlterationState } from '../models/columns-alteration'
import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { OrderColumnsAlteration } from '../models/columns-alterations/order.columns-alteration'
import { SortColumnsAlteration } from '../models/columns-alterations/sort.columns-alteration'
import { WidthColumnsAlteration } from '../models/columns-alterations/width.columns-alteration'

export function mapColumnsAlterationsStates(states: ColumnsAlterationState[]): ColumnsAlteration[] {
  const alterations: ColumnsAlteration[] = []

  for (const state of states) {
    try {
      switch (state.type) {
        case 'hide-column': alterations.push(new HideColumnColumnsAlteration(state.state, true)); break
        case 'width': alterations.push(new WidthColumnsAlteration(state.state, true)); break
        case 'order': alterations.push(new OrderColumnsAlteration(state.state, true)); break
        case 'sort': alterations.push(new SortColumnsAlteration(state.state, true)); break
        default: {
          if (isDevMode()) {
            // eslint-disable-next-line no-console
            console.warn('Unrecognized ColumnsAlteration state', state)
          }
        }
      }
    } catch (e) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn('Unable to map ColumnsAlteration state', state)
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    }
  }

  return alterations
}
