import { isDevMode } from '@angular/core'
import { map, Observable, of, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs'

import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamPreferencesAccessor } from './preferences-accessor'
import { TheSeamPreferencesBase } from './preferences.models'

export type TheSeamPreferencesRecordStatus = 'pending' | 'loaded'

export interface TheSeamPreferencesRecordStatusChange {
  previous: TheSeamPreferencesRecordStatus
  current: TheSeamPreferencesRecordStatus
}

export class TheSeamPreferencesMapRecord {

  private readonly _refreshSubject = new Subject<void>()
  private readonly _statusChangeSubject = new Subject<TheSeamPreferencesRecordStatusChange>()

  private _status: TheSeamPreferencesRecordStatus = 'pending'

  public readonly observable: Observable<TheSeamPreferencesBase>
  public readonly statusChange: Observable<TheSeamPreferencesRecordStatusChange>

  constructor(
    private readonly _key: string,
    private readonly _accessor: TheSeamPreferencesAccessor,
    private readonly _emptyPrefs: TheSeamPreferencesBase,
  ) {
    this.observable = this._createObservable()
    this.statusChange = this._statusChangeSubject.asObservable()
  }

  private _createObservable(): Observable<TheSeamPreferencesBase> {
    if (!this._accessor) {
      return of(this._emptyPrefs)
    }

    const accessor = (key: string): Observable<string> =>
      this._accessor ? this._accessor.get(key) : of(JSON.stringify(this._emptyPrefs))

    return this._refreshSubject.pipe(
      startWith(undefined),
      switchMap(() => accessor(this._key).pipe(
        map(v => {
          if (!v) {
            return null
          }

          // TODO: Add a schema validator and migration tool to avoid parsing issues.
          try {
            return this._descerializePreferences(v)
          } catch (error) {
            if (isDevMode()) {
              // eslint-disable-next-line no-console
              console.error(error)
            }
            return null
          }
        }),
        map(v => notNullOrUndefined(v) ? v : this._emptyPrefs),
        // tap(v => console.log('preferences$', v)),
        tap(() => {
          this._setStatus('loaded')
        })
      )),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
  }

  public refresh(): void {
    this._setStatus('pending')
    this._refreshSubject.next()
  }

  public isSameAccessor(accessor: TheSeamPreferencesAccessor): boolean {
    return this._accessor === accessor
  }

  public isSameEmptyPrefs(emptyPrefs: TheSeamPreferencesBase): boolean {
    return JSON.stringify(this._emptyPrefs) === JSON.stringify(emptyPrefs)
  }

  get status(): TheSeamPreferencesRecordStatus {
    return this._status
  }

  private _setStatus(status: TheSeamPreferencesRecordStatus): void {
    if (this._status === status) {
      return
    }
    const prev = this._status
    this._status = status
    this._statusChangeSubject.next({ previous: prev, current: status })
  }

  private _descerializePreferences(serialized: string): TheSeamPreferencesBase {
    const prefs = JSON.parse(serialized)

    // TODO: Implement migration

    return prefs
  }
}
