import { SortType } from '@marklb/ngx-datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { SortItem } from '../sort-item'
import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableAccessor } from '../datatable-accessor'
import { TheSeamDatatableColumn } from '../table-column'

// NOTE: This doesn't act on a single SortItem, because dealing with conflicts
// between if a sort was added by an alteration or datatable input is difficult
// to determine. There may be some good assumptions for handling the issues, but
// for now I think it is safest to just store the whole sorts array as an
// alteration.
export interface SortColumnsAlterationState {
  sorts: SortItem[]
}

export class SortColumnsAlteration extends ColumnsAlteration<SortColumnsAlterationState> {
  public readonly id: string

  public readonly type: string = 'sort'

  constructor(
    state: SortColumnsAlterationState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}`
  }

  public apply(columns: TheSeamDatatableColumn<any, any>[], datatable: TheSeamDatatableAccessor): void {
    if (datatable.sortType === SortType.single) {
      datatable.sorts = this.state.sorts.length > 0 ? [ this.state.sorts[0] ] : []
    } else {
      datatable.sorts = this.state.sorts
    }
  }

  private _isValidState(state: SortColumnsAlterationState): boolean {
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
