import { TableColumnProp } from '@marklb/ngx-datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { getColumnProp } from '../../utils/get-column-prop'
import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableAccessor } from '../datatable-accessor'
import { TheSeamDatatableColumn } from '../table-column'

export interface WidthColumnsAlterationState {
  columnProp: TableColumnProp
  width?: number
  canAutoResize: boolean
}

export class WidthColumnsAlteration extends ColumnsAlteration<WidthColumnsAlterationState> {
  public readonly id: string

  public readonly type: string = 'width'

  constructor(
    state: WidthColumnsAlterationState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}--${state.columnProp}`
  }

  public apply(columns: TheSeamDatatableColumn<any, any>[], datatable: TheSeamDatatableAccessor): void {
    for (const col of columns) {
      const prop = getColumnProp(col)
      if (prop === this.state.columnProp) {
        col.canAutoResize = this.state.canAutoResize
        if (notNullOrUndefined(this.state.width)) {
          col.width = this.state.width
        }
      }
    }
  }

  private _isValidState(state: WidthColumnsAlterationState): boolean {
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
    if (!notNullOrUndefined(state.canAutoResize)) {
      return false
    }

    return true
  }
}
