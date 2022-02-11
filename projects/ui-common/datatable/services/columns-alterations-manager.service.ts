import { Injectable } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { ColumnsAlteration } from '../models/columns-alteration'
import { TheSeamDatatableColumn } from '../models/table-column'
import { TheSeamDatatableAccessor } from '../models/datatable-accessor'

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

  public clear(): void {
    // TODO: Implement

    // NOTE: Just removing does not work, because some have need an alteration
    // to be undone. I am not sure if there is a generic way to do this.
    // this.remove(this.get())
  }

  private _removeNonPersistant(): void {
    const nonPersistent = this._alterations.filter(x => !x.persistent)
    this.remove(nonPersistent, { emitEvent: false })
  }

  private _emitChanges(changes: ColumnsAlterationsChangedRecord[]): void {
    const event: ColumnsAlterationsChangedEvent = {
      changes
    }

    this._changesSubject.next(event)
  }

}
