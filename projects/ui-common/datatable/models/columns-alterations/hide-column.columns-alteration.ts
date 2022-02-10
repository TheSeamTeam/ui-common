import { TableColumnProp } from '@marklb/ngx-datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { getColumnProp } from '../../utils/get-column-prop'
import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableColumn } from '../table-column'

export interface HideColumnColumnsAlterationState {
  columnProp: TableColumnProp
  hidden: boolean
}

export class HideColumnColumnsAlteration extends ColumnsAlteration<HideColumnColumnsAlterationState> {
  public readonly id: string

  public readonly type: string = 'hide-column'

  constructor(
    state: HideColumnColumnsAlterationState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}--${state.columnProp}`
  }

  public apply(columns: TheSeamDatatableColumn<any, any>[]): void {
    for (const col of columns) {
      const prop = getColumnProp(col)
      if (prop === this.state.columnProp) {
        col.hidden = this.state.hidden
      }
    }
  }

  private _isValidState(state: HideColumnColumnsAlterationState): boolean {
    // NOTE: Checking null or undefined, even though the type doesn't allow,
    // because the state may have been loaded from an invalid persistant
    // storage.

    // TODO: Remove when state validation/migration is implemented to happen
    // when retrieved from storage.
    if (!notNullOrUndefined(state.columnProp)) {
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
