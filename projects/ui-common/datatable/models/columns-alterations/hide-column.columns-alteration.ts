import { TableColumnProp } from '@marklb/ngx-datatable';
import { notNullOrUndefined } from '@theseam/ui-common/utils';
import { getColumnProp } from '../../utils/get-column-prop';

import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableColumn } from '../table-column';

export interface HideColumnState {
  columnProp: TableColumnProp
  hidden: boolean
}

export class HideColumnColumnsAlteration extends ColumnsAlteration<HideColumnState> {
  public readonly id: string = ''

  public readonly type: string = 'hide-column'

  constructor(
    state: HideColumnState,
    persistent: boolean
  ) {
    super(state, persistent)

    if (this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }
  }

  public apply(columns: TheSeamDatatableColumn<any, any>[]): void {
    for (const col of columns) {
      const prop = getColumnProp(col)
      if (prop === this.state.columnProp) {
        col.hidden = true
      }
    }
  }

  private _isValidState(state: HideColumnState): boolean {
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
