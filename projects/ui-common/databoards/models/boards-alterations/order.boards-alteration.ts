import { isDevMode } from '@angular/core'

import { arrayMoveMutable, notNullOrUndefined } from '@theseam/ui-common/utils'

import { getBoardProp } from '../../utils/get-board-prop'
import { BoardsAlteration } from '../board-alteration'
import { DataboardBoard } from '../databoard-board'
import { TheSeamDataboardListAccessor } from '../databoard-list-accessor'

export interface BoardOrderRecord {
  boardProp: string
  index: number
}

export interface OrderBoardsAlterationState {
  // NOTE: This stores the board index of reordered boards only, to avoid any
  // new boards from always being placed at the end. The moved boards should
  // always be accurate relative to each other, but if this becomes an issue
  // then we can just store all the boards positions.
  boards: BoardOrderRecord[]
}

export class OrderBoardsAlteration extends BoardsAlteration<OrderBoardsAlterationState> {
  public readonly id: string

  public readonly type: string = 'order'

  constructor(
    state: OrderBoardsAlterationState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}`
  }

  public apply(boards: DataboardBoard[], databoardList: TheSeamDataboardListAccessor): void {
    if (this.state.boards.length === 0) {
      return
    }

    const stateBoards = this._stateBoards()

    for (const c of stateBoards) {
      const currentIndex = boards.findIndex(x => getBoardProp(x) === c.boardProp)
      if (currentIndex === c.index || currentIndex === -1) {
        // Skip if already at correct index.
        // Skip boards not found. It may be a board that was removed from the
        // list, but we still want to handle the other boards.
        continue
      }

      arrayMoveMutable(boards, currentIndex, c.index)
    }
  }

  private _isValidState(state: OrderBoardsAlterationState): boolean {
    // NOTE: Checking null or undefined, even though the type doesn't allow,
    // because the state may have been loaded from an invalid persistant
    // storage.

    // TODO: Remove when state validation/migration is implemented to happen
    // when retrieved from storage.
    if (!notNullOrUndefined(state.boards)) {
      return false
    }

    // NOTE: Didn't iterate each board record, because it is probably better to
    // just skip to invalid board records. It does prevent being able to
    // validate the whole state though.

    return true
  }

  private _isBoardOrderRecordValid(boardOrder: BoardOrderRecord): boolean {
    return notNullOrUndefined(boardOrder.boardProp) && notNullOrUndefined(boardOrder.index)
  }

  private _stateBoards(): BoardOrderRecord[] {
    return this.state.boards.filter(c => {
      if (!this._isBoardOrderRecordValid(c)) {
        if (isDevMode()) {
          // eslint-disable-next-line no-console
          console.warn('Invalid board order record', c)
        }
        return false
      }
      return true
    }).sort((a, b) => a.index === b.index ? 0 : a.index > b.index ? 1 : -1)
  }
}
