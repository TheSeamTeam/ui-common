import { TableColumnProp } from '@marklb/ngx-datatable'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { getColumnProp } from '../../utils/get-column-prop'
import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableAccessor } from '../datatable-accessor'
import { TheSeamDatatableColumn } from '../table-column'
import { AlterationDisplayItem } from '../../../datatable-alterations-display/models/alteration-display.model'

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

  public apply(columns: TheSeamDatatableColumn<any, any>[], datatable: TheSeamDatatableAccessor): void {
    for (const col of columns) {
      const prop = getColumnProp(col)
      if (prop === this.state.columnProp) {
        col.hidden = this.state.hidden
      }
    }
  }

  public toDisplayItem(): AlterationDisplayItem {
    const summary = this._createHideSummary()
    const details = this._createHideDetails()

    return {
      id: this.id,
      type: this.type,
      summary,
      details,
      sortOrder: this._getColumnSortOrder()
    }
  }

  public getDisplaySortOrder(): number {
    return this._getColumnSortOrder()
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

  private _createHideSummary(): string {
    const action = this.state.hidden ? 'Hidden' : 'Shown'
    return `${action}: ${this.state.columnProp}`
  }

  private _createHideDetails(): string[] {
    const action = this.state.hidden ? 'hidden' : 'visible'
    return [`Column: ${this.state.columnProp}`, `Status: ${action}`]
  }

  private _getColumnSortOrder(): number {
    // Sort by column name for consistent ordering
    return String(this.state.columnProp).charCodeAt(0)
  }
}
