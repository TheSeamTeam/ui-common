import { isDevMode } from '@angular/core'
import { BoardsAlteration, BoardsAlterationState } from '../models/board-alteration'
import { HideBoardBoardsAlteration } from '../models/boards-alterations/hide-board.boards-alteration'
import { OrderBoardsAlteration } from '../models/boards-alterations/order.boards-alteration'
import { SortBoardsAlteration } from '../models/boards-alterations/sort.boards-alteration'

export function mapBoardsAlterationsStates(states: BoardsAlterationState[]): BoardsAlteration[] {
  const alterations: BoardsAlteration[] = []

  for (const state of states) {
    try {
      switch (state.type) {
        case 'hide-board': alterations.push(new HideBoardBoardsAlteration(state.state, true)); break
        case 'order': alterations.push(new OrderBoardsAlteration(state.state, true)); break
        case 'sort': alterations.push(new SortBoardsAlteration(state.state, true)); break
        default: {
          if (isDevMode()) {
            // eslint-disable-next-line no-console
            console.warn('Unrecognized BoardsAlteration state', state)
          }
        }
      }
    } catch (e) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn('Unable to map BoardsAlteration state', state)
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    }
  }

  return alterations
}
