import { Inject, Injectable, isDevMode } from '@angular/core'
import { Observable, of, Subject } from 'rxjs'
import { map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators'

import { hasProperty } from '../../utils/has-property'
import { ITheSeamDatatablePreferences, ITheSeamDatatablePreferencesColumn } from '../models/preferences'
import { ITheSeamDatatablePreferencesAccessor } from '../models/preferences-accessor'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import { withStoredColumnInfo } from '../utils/with-stored-column-info'

export interface IDatatablePreferencesMapRecord {
  observable: Observable<ITheSeamDatatablePreferences>
  refresh: Subject<void>
}

/**
 * NOTE: This will integrate with the ui-common implementation or may go away
 * when the ui-common implementation is done.
 */
@Injectable({
  providedIn: 'root'
})
export class DatatablePreferencesService {

  private readonly _tablePrefsMap = new Map<string, IDatatablePreferencesMapRecord>()
  private _pending = false

  public get pending() { return this._pending }

  constructor(
    @Inject(THESEAM_DATATABLE_PREFERENCES_ACCESSOR) private _prefsAccessor?: ITheSeamDatatablePreferencesAccessor
  ) { }

  public preferences(preferenceKey: string): Observable<ITheSeamDatatablePreferences> {
    let prefs = this._tablePrefsMap.get(preferenceKey)
    if (!prefs) {
      const refreshSubject = new Subject<void>()
      prefs = {
        observable: this._createObservable(refreshSubject, preferenceKey),
        refresh: refreshSubject
      }
      this._tablePrefsMap.set(preferenceKey, prefs)
    }
    return prefs.observable
  }

  private _createObservable(refreshSubject: Subject<void>, prefKey: string): Observable<ITheSeamDatatablePreferences> {
    if (!this._prefsAccessor) {
      return of({})
    }

    const accessor = (key: string): Observable<string> =>
      this._prefsAccessor ? this._prefsAccessor.get(key) : of('{}')

    return refreshSubject.pipe(
      startWith({}),
      switchMap(() => accessor(prefKey).pipe(
        map(v => {
          if (!v) {
            return null
          }

          // TODO: Add a schema validator and migration tool to avoid parsing issues.
          try {
            return JSON.parse(v) as ITheSeamDatatablePreferences
          } catch (error) {
            if (isDevMode()) {
              console.error(error)
            }
            return null
          }
        }),
        map(v => !!v ? v : {}),
        // tap(v => console.log('preferences$', v))
        // tap(v => this._pending = false)
      )),
      shareReplay(1)
    )
  }

  public refresh(preferenceKey: string): void {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    if (prefs) {
      this._pending = true
      prefs.refresh.next()
    }
  }

  // TODO: Improve this updating to not be more generic, so we can quickly add
  // edits for different preference schema's.
  //
  // TODO: Decide if a send queue/merging of pending queue is needed to avoid
  // out of order updates. This shouldn't be an issue, with how fast preferences
  // will most likely be changing, but it could happen in situations, such as
  // network issues.
  public setColumnPreference(preferenceKey: string, column: ITheSeamDatatablePreferencesColumn): void {
    if (!this._prefsAccessor) {
      return
    }

    this._pending = true
    this.preferences(preferenceKey).pipe(
      map(prefs => {
        // Making the preferences immutable may not be necessary, but for now
        // this obj->str->obj will work as a naive clone.
        const columns = JSON.parse(JSON.stringify(prefs.columns || []))
        const _colPref = columns.find(c => c.prop === column.prop)
        // console.log('has', _colPref)
        if (_colPref) {
          // console.log('hasProperty(column, "width"))', hasProperty(column, 'width'))
          if (hasProperty(column, 'width')) { _colPref.width = column.width }
          if (hasProperty(column, 'canAutoResize')) { _colPref.canAutoResize = column.canAutoResize }
          if (hasProperty(column, 'hidden')) { _colPref.hidden = column.hidden }
        } else {
          columns.push({ ...column })
        }
        const newPrefs: ITheSeamDatatablePreferences = { ...prefs, columns }
        return newPrefs
      }),
      // tap(v => console.log('newPrefs', v)),
      take(1),
      switchMap(newPrefs => this._prefsAccessor
        ? this._prefsAccessor.update(preferenceKey, JSON.stringify(newPrefs))
        : of(newPrefs)
      ),
      tap(() => this.refresh(preferenceKey))
    )
    .subscribe()
  }

  public withColumnPreferences<T>(preferenceKey: string, columns: T[]): Observable<T[]> {
    return this.preferences(preferenceKey).pipe(
      startWith({} as ITheSeamDatatablePreferences),
      map(preferences => preferences && preferences.columns
        ? withStoredColumnInfo(columns, preferences.columns) as T[]
        : columns
      )
    )
  }

}
