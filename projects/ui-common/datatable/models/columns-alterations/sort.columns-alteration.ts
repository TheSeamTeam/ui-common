import { SortType } from '@marklb/ngx-datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { SortItem } from '../sort-item'
import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableAccessor } from '../datatable-accessor'
import { TheSeamDatatableColumn } from '../table-column'
import { AlterationDisplayItem } from '../../../datatable-alterations-display/models/alteration-display.model'

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
    persistent: boolean,
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

  public toDisplayItem(): AlterationDisplayItem {
    const summary = this._createSortSummary()
    const details = this._createSortDetails()

    return {
      id: this.id,
      type: this.type,
      summary,
      details,
      sortOrder: 0,
    }
  }

  public getDisplaySortOrder(): number {
    return 0 // Only one sort alteration per table
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

  private _createSortSummary(): string {
    if (this.state.sorts.length === 0) {
      return 'No sorting'
    }

    const sortDescriptions = this.state.sorts.map(sort => {
      const direction = sort.dir === 'asc' ? '↑' : '↓'
      return `${sort.prop} ${direction}`
    })

    return sortDescriptions.join(', ')
  }

  private _createSortDetails(): string[] {
    if (this.state.sorts.length === 0) {
      return ['No columns are currently sorted']
    }

    return this.state.sorts.map((sort, index) => {
      const direction = sort.dir === 'asc' ? 'Ascending' : 'Descending'
      const priority = this.state.sorts.length > 1 ? ` (Priority: ${index + 1})` : ''
      return `${sort.prop}: ${direction}${priority}`
    })
  }
}
