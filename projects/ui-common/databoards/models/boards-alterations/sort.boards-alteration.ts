import { notNullOrUndefined } from '@theseam/ui-common/utils'
import { DataFilterSortItem, DataFilterSortType } from '@theseam/ui-common/data-filters'

import { BoardsAlteration } from '../board-alteration'
import { DataboardBoard } from '../databoard-board'
import { TheSeamDataboardListAccessor } from '../databoard-list-accessor'

// NOTE: This doesn't act on a single SortItem, because dealing with conflicts
// between if a sort was added by an alteration or databoard list input is difficult
// to determine. There may be some good assumptions for handling the issues, but
// for now I think it is safest to just store the whole sorts array as an
// alteration.
export interface SortBoardsAlterationState {
  sorts: DataFilterSortItem[]
}

export class SortBoardsAlteration extends BoardsAlteration<SortBoardsAlterationState> {
  public readonly id: string

  public readonly type: string = 'sort'

  constructor(
    state: SortBoardsAlterationState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}`
  }

  public apply(boards: DataboardBoard[], databoardList: TheSeamDataboardListAccessor): void {
    if (databoardList.sortType === DataFilterSortType.single) {
      let groupSorts = []
      if (this.state.sorts.length <= 1) {
        groupSorts = this.state.sorts
      } else {
        groupSorts = this.state.sorts.reduceRight((agg, sort) => {
          if (agg.findIndex(a => a.boardProp === sort.boardProp) === -1) {
            agg.push(sort)
          }
          return agg
        }, [] as DataFilterSortItem[])
      }

      databoardList.sorts = groupSorts
    } else {
      databoardList.sorts = this.state.sorts
    }
  }

  private _isValidState(state: SortBoardsAlterationState): boolean {
    // NOTE: Checking null or undefined, even though the type doesn't allow,
    // because the state may have been loaded from an invalid persistant
    // storage.

    // TODO: Remove when state validation/migration is implemented to happen
    // when retrieved from storage.
    if (!notNullOrUndefined(state.sorts)) {
      return false
    }

    return true
  }
}
