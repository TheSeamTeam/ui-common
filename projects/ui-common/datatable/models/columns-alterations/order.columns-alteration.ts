import { isDevMode } from '@angular/core'

import { TableColumnProp } from '@marklb/ngx-datatable'
import { arrayMoveMutable, notNullOrUndefined } from '@theseam/ui-common/utils'

import { getColumnProp } from '../../utils/get-column-prop'
import { ColumnsAlteration } from '../columns-alteration'
import { TheSeamDatatableAccessor } from '../datatable-accessor'
import { isInternalColumn } from '../internal-column-props'
import { TheSeamDatatableColumn } from '../table-column'
import { AlterationDisplayItem } from '../../../datatable-alterations-display/models/alteration-display.model'

export interface ColumnOrderRecord {
  columnProp: TableColumnProp
  index: number
}

export interface OrderColumnsAlterationState {
  // NOTE: This stores the column index of reordered columns only, to avoid any
  // new columns from always being placed at the end. The moved columns should
  // always be accurate relative to each other, but if this becomes an issue
  // then we can just store all the columns positions.
  columns: ColumnOrderRecord[]
}

export class OrderColumnsAlteration extends ColumnsAlteration<OrderColumnsAlterationState> {
  public readonly id: string

  public readonly type: string = 'order'

  constructor(state: OrderColumnsAlterationState, persistent: boolean) {
    super(state, persistent)

    if (!this._isValidState(state)) {
      throw Error(`Invalid state: ${JSON.stringify(state)}`)
    }

    this.id = `${this.type}`
  }

  public apply(
    columns: TheSeamDatatableColumn<any, any>[],
    datatable: TheSeamDatatableAccessor,
  ): void {
    if (this.state.columns.length === 0) {
      return
    }

    const stateColumns = this._stateColumns()

    // The internal columns are not intended for a user to be able to move them.
    // Store the internal columns current index, so it can be moved back ofter
    // sorting. This may not be the best way to do this, but it is easier than
    // making a sort that avoids them.
    //
    // NOTE: If we add an internal column that can be moved then this will need
    // to be changed.
    const internalColumns = columns
      .map((column, index) => ({ column, index }))
      .filter((x) => isInternalColumn(x.column))

    for (const c of stateColumns) {
      const currentIndex = columns.findIndex(
        (x) => getColumnProp(x) === c.columnProp,
      )
      if (currentIndex === c.index || currentIndex === -1) {
        // Skip if already at correct index.
        // Skip columns not found. It may be a column that was removed from the
        // table, but we still want to handle the other columns.
        continue
      }

      arrayMoveMutable(columns, currentIndex, c.index)
    }

    for (const c of internalColumns) {
      const currentIndex = columns.findIndex((col) => col === c.column)
      if (currentIndex !== -1) {
        arrayMoveMutable(columns, currentIndex, c.index)
      } else {
        if (isDevMode()) {
          // eslint-disable-next-line no-console
          console.warn(
            `Internal column could not be found after sorting. Was it lost during the sorting?`,
          )
        }
      }
    }
  }

  public toDisplayItem(): AlterationDisplayItem {
    const summary = this._createOrderSummary()
    const details = this._createOrderDetails()

    return {
      id: this.id,
      type: this.type,
      summary,
      details,
      sortOrder: 0,
    }
  }

  public getDisplaySortOrder(): number {
    return 0 // Only one order alteration per table
  }

  private _isValidState(state: OrderColumnsAlterationState): boolean {
    // NOTE: Checking null or undefined, even though the type doesn't allow,
    // because the state may have been loaded from an invalid persistant
    // storage.

    // TODO: Remove when state validation/migration is implemented to happen
    // when retrieved from storage.
    if (!notNullOrUndefined(state.columns)) {
      return false
    }

    // NOTE: Didn't iterate each column record, because it is probably better to
    // just skip to invalid column records. It does prevent being able to
    // validate the whole state though.

    return true
  }

  private _isColumnOrderRecordValid(columnOrder: ColumnOrderRecord): boolean {
    return (
      notNullOrUndefined(columnOrder.columnProp) &&
      notNullOrUndefined(columnOrder.index)
    )
  }

  private _stateColumns(): ColumnOrderRecord[] {
    return this.state.columns
      .filter((c) => {
        if (!this._isColumnOrderRecordValid(c)) {
          if (isDevMode()) {
            // eslint-disable-next-line no-console
            console.warn('Invalid column order record', c)
          }
          return false
        }
        return true
      })
      .sort((a, b) => (a.index === b.index ? 0 : a.index > b.index ? 1 : -1))
  }

  private _createOrderSummary(): string {
    if (this.state.columns.length === 0) {
      return 'Default column order'
    }

    const reorderedCount = this.state.columns.length
    return `${reorderedCount} column${reorderedCount === 1 ? '' : 's'} reordered`
  }

  private _createOrderDetails(): string[] {
    if (this.state.columns.length === 0) {
      return ['Columns are in their default order']
    }

    const sortedColumns = this._stateColumns()
    return sortedColumns.map(
      (col) => `${col.columnProp}: Position ${col.index + 1}`,
    )
  }
}
