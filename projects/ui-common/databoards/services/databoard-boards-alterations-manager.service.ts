import { Injectable } from '@angular/core'
import { Observable, Subject, tap } from 'rxjs'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { BoardsAlteration } from '../models/board-alteration'
import { DataboardBoard } from '../models/databoard-board'
import { TheSeamDataboardListAccessor } from '../models/databoard-list-accessor'
import { HideBoardBoardsAlteration } from '../models/boards-alterations/hide-board.boards-alteration'
import { SortBoardsAlteration } from '../models/boards-alterations/sort.boards-alteration'

export interface BoardsAlterationsChangedRecord {
  type: 'added' | 'removed'
  alteration: BoardsAlteration
}

export interface BoardsAlterationsChangedEvent {
  changes: BoardsAlterationsChangedRecord[]
}

@Injectable()
export class DataboardBoardsAlterationsManagerService {

  private readonly _changesSubject = new Subject<BoardsAlterationsChangedEvent>()
  private _alterations: BoardsAlteration[] = []

  public readonly changes$: Observable<BoardsAlterationsChangedEvent>

  constructor() {
    this.changes$ = this._changesSubject.asObservable()
  }

  public get(): BoardsAlteration[] {
    return [ ...this._alterations ]
  }

  /**
   * Adds alterations to be applied to boards.
   *
   * If an alteration with the same `id` already exists then the existing
   * alteration will be removed and the new one added.
   *
   * NOTE: When there is a duplicate alteration the old alteration is removed,
   * instead of updated, to maintain the order alterations are applied.
   */
  public add(alterations: BoardsAlteration[], options?: { emitEvent?: boolean }): BoardsAlterationsChangedRecord[] {
    const removed: BoardsAlterationsChangedRecord[] = this.remove(alterations, { emitEvent: false })
    this._alterations = [ ...this._alterations, ...alterations ]

    const changes: BoardsAlterationsChangedRecord[] = [
      ...removed,
      ...alterations.map(a => {
        const record: BoardsAlterationsChangedRecord = {
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

  public remove(alterations: BoardsAlteration[], options?: { emitEvent?: boolean }): BoardsAlterationsChangedRecord[] {
    const removed: BoardsAlterationsChangedRecord[] = []
    this._alterations = this._alterations.filter(x => {
      const found = alterations.findIndex(y => y.id === x.id) !== -1
      if (found) {
        const eventRecord: BoardsAlterationsChangedRecord = {
          type: 'removed',
          alteration: x
        }
        removed.push(eventRecord)
      }
      return !found
    })

    if (notNullOrUndefined(options?.emitEvent) && !options?.emitEvent) {
      return removed
    }

    this._emitChanges(removed)

    return removed
  }

  public apply(boards: DataboardBoard[], databoardsList: TheSeamDataboardListAccessor): void {
    for (const a of this._alterations) {
      a.apply(boards, databoardsList)
    }

    this._removeNonPersistant()
  }

  // TODO: Make aware of original board order and properties. This is tricky,
  // because the list does not deal with immutable board/card records and
  // it is hard to know where changes happened. Just serializing the boards
  // input is not enough, because the boards input is called anytime the user
  // makes a board change. We can probably come up with a mostly accurate
  // implementation, such as "reset original boards cache when preferencesKey
  // changes" or "number of boards change". There are issues with those rules,
  // but with some testing/experimenting I think there should be a "good enough"
  // solution.
  //
  // TODO: Find a generic way to clear alterations. I would like to add an
  // `unapply` method to `BoardsAlteration`, but since the alterations
  // themselves are not too generic it may be tricky.
  public clear(options?: { emitEvent?: boolean }): BoardsAlterationsChangedRecord[] {
    const changes: BoardsAlterationsChangedRecord[] = []
    for (const alt of this._alterations) {
      switch (alt.type) {
        case 'hide-board': {
          const alteration = new HideBoardBoardsAlteration({ boardProp: alt.state.boardProp, hidden: false }, false)
          changes.push(...this.add([ alteration ]))
          break
        }
        case 'order': {
          changes.push(...this.remove([ alt ]))
          break
        }
        case 'sort': {
          const alteration = new SortBoardsAlteration({ sorts: [] }, false)
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

  private _emitChanges(changes: BoardsAlterationsChangedRecord[]): void {
    if (changes.length === 0) {
      return
    }

    const event: BoardsAlterationsChangedEvent = {
      changes
    }

    this._changesSubject.next(event)
  }

}
