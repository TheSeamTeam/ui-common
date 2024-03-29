import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { ColumnsAlteration } from '../models/columns-alteration'
import { TheSeamDatatableColumn } from '../models/table-column'
import { TheSeamDatatableAccessor } from '../models/datatable-accessor'
import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { SortColumnsAlteration } from '../models/columns-alterations/sort.columns-alteration'
import { WidthColumnsAlteration } from '../models/columns-alterations/width.columns-alteration'

export interface ColumnsAlterationsChangedRecord {
  type: 'added' | 'removed'
  alteration: ColumnsAlteration
}

export interface ColumnsAlterationsChangedEvent {
  changes: ColumnsAlterationsChangedRecord[]
}

@Injectable()
export class ColumnsAlterationsManagerService {

  private readonly _changesSubject = new Subject<ColumnsAlterationsChangedEvent>()
  private _alterations: ColumnsAlteration[] = []

  public readonly changes: Observable<ColumnsAlterationsChangedEvent>

  constructor() {
    this.changes = this._changesSubject.asObservable()
  }

  public get(): ColumnsAlteration[] {
    return [ ...this._alterations ]
  }

  /**
   * Adds alterations to be applied to columns.
   *
   * If an alteration with the same `id` already exists then the existing
   * alteration will be removed and the new one added.
   *
   * NOTE: When there is a duplicate alteration the old alteration is removed,
   * instead of updated, to maintain the order alterations are applied.
   */
  public add(alterations: ColumnsAlteration[], options?: { emitEvent?: boolean }): ColumnsAlterationsChangedRecord[] {
    // console.log('add', alterations)
    const removed: ColumnsAlterationsChangedRecord[] = this.remove(alterations, { emitEvent: false })
    this._alterations = [ ...this._alterations, ...alterations ]

    const changes: ColumnsAlterationsChangedRecord[] = [
      ...removed,
      ...alterations.map(a => {
        const record: ColumnsAlterationsChangedRecord = {
          type: 'added',
          alteration: a
        }
        return record
      })
    ]

    if (notNullOrUndefined(options?.emitEvent) && !options?.emitEvent) {
      return changes
    }

    this._emitChanges(changes)

    return changes
  }

  public remove(alterations: ColumnsAlteration[], options?: { emitEvent?: boolean }): ColumnsAlterationsChangedRecord[] {
    // console.log('remove', alterations)
    const removed: ColumnsAlterationsChangedRecord[] = []
    this._alterations = this._alterations.filter(x => {
      const found = alterations.findIndex(y => y.id === x.id) !== -1
      if (found) {
        const eventRecord: ColumnsAlterationsChangedRecord = {
          type: 'removed',
          alteration: x
        }
        removed.push(eventRecord)
      }
      return !found
    })

    // console.log('removed', removed, this._alterations)

    if (notNullOrUndefined(options?.emitEvent) && !options?.emitEvent) {
      return removed
    }

    this._emitChanges(removed)

    return removed
  }

  public apply(columns: TheSeamDatatableColumn[], datatable: TheSeamDatatableAccessor): void {
    for (const a of this._alterations) {
      a.apply(columns, datatable)
    }

    this._removeNonPersistant()
  }

  // TODO: Make aware of original column order and properties. This is tricky,
  // because the datatable does not deal with immutable column/row records and
  // it is hard to know where changes happened. Just serializing the columns
  // input is not enough, because the columns input is called anytime the user
  // makes a column change. We can probably come up with a mostly accurate
  // implementation, such as "reset original columns cache when preferencesKey
  // changes" or "number of columns change". There are issues with those rules,
  // but with some testing/experimenting I think there should be a "good enough"
  // solution.
  //
  // TODO: Find a generic way to clear alterations. I would like to add an
  // `unapply` method to `ColumnsAlteration`, but since the alterations
  // themselves are not too generic it may be tricky.
  public clear(options?: { emitEvent?: boolean }): ColumnsAlterationsChangedRecord[] {
    const changes: ColumnsAlterationsChangedRecord[] = []
    for (const colAlt of this._alterations) {
      switch (colAlt.type) {
        case 'hide-column': {
          const alteration = new HideColumnColumnsAlteration({ columnProp: colAlt.state.columnProp, hidden: false }, false)
          changes.push(...this.add([ alteration ]))
          break
        }
        case 'order': {
          changes.push(...this.remove([ colAlt ]))
          break
        }
        case 'sort': {
          const alteration = new SortColumnsAlteration({ sorts: [] }, false)
          changes.push(...this.add([ alteration ]))
          break
        }
        case 'width': {
          const alteration = new WidthColumnsAlteration({ columnProp: colAlt.state.columnProp, canAutoResize: true }, false)
          changes.push(...this.add([ alteration ]))
          break
        }
      }
    }

    if (notNullOrUndefined(options?.emitEvent) && !options?.emitEvent) {
      return changes
    }

    this._emitChanges(changes)

    return changes
  }

  private _removeNonPersistant(): void {
    const nonPersistent = this._alterations.filter(x => !x.persistent)
    this.remove(nonPersistent, { emitEvent: false })
  }

  private _emitChanges(changes: ColumnsAlterationsChangedRecord[]): void {
    if (changes.length === 0) {
      return
    }

    const event: ColumnsAlterationsChangedEvent = {
      changes
    }

    this._changesSubject.next(event)
  }

}
