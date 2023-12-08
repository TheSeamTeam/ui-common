import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { getBoardProp } from '../../utils/get-board-prop'
import { BoardsAlteration } from '../board-alteration'
import { DataboardBoard } from '../databoard-board'
import { TheSeamDataboardListAccessor } from '../databoard-list-accessor'

export interface HideBoardBoardsAlterationState {
  boardProp: string
  hidden: boolean
}

export class HideBoardBoardsAlteration extends BoardsAlteration<HideBoardBoardsAlterationState> {
  public readonly id: string

  public readonly type: string = 'hide-board'

  constructor(
    state: HideBoardBoardsAlterationState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}--${state.boardProp}`
  }

  public apply(boards: DataboardBoard[], databoardList: TheSeamDataboardListAccessor): void {
    for (const board of boards) {
      const prop = getBoardProp(board)
      if (prop === this.state.boardProp) {
        board.hidden = this.state.hidden
      }
    }
  }

  private _isValidState(state: HideBoardBoardsAlterationState): boolean {
    // NOTE: Checking null or undefined, even though the type doesn't allow,
    // because the state may have been loaded from an invalid persistant
    // storage.

    // TODO: Remove when state validation/migration is implemented to happen
    // when retrieved from storage.
    if (!notNullOrUndefined(state.boardProp)) {
      return false
    }

    // TODO: Remove when state validation/migration is implemented to happen
    // when retrieved from storage.
    if (!notNullOrUndefined(state.hidden)) {
      return false
    }

    return true
  }
}
