import { Inject, Injectable, isDevMode, Optional } from '@angular/core'
import { Observable, of, Subject } from 'rxjs'
import { map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators'

import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'
import { EMPTY_DATATABLE_PREFERENCES, TheSeamDatatablePreferences, TheSeamDatatablePreferencesColumn } from '../models/preferences'
import type { TheSeamDatatablePreferencesAccessor } from '../models/preferences-accessor'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import { withStoredColumnInfo } from '../utils/with-stored-column-info'
import { ColumnsAlterationState } from '../models/columns-alteration'

export interface IDatatablePreferencesMapRecord {
  observable: Observable<TheSeamDatatablePreferences>
  refresh: Subject<void>
}

@Injectable({
  providedIn: 'root'
})
export class DatatablePreferencesService {

  private readonly _tablePrefsMap = new Map<string, IDatatablePreferencesMapRecord>()
  private _pending = false
  private _loaded = false

  public get pending() { return this._pending }
  public get loaded() { return this._loaded }

  constructor(
    @Optional() @Inject(THESEAM_DATATABLE_PREFERENCES_ACCESSOR) private _prefsAccessor?: TheSeamDatatablePreferencesAccessor
  ) { }

  public preferences(preferenceKey: string): Observable<TheSeamDatatablePreferences> {
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

  private _createObservable(refreshSubject: Subject<void>, prefKey: string): Observable<TheSeamDatatablePreferences> {
    if (!this._prefsAccessor) {
      return of(EMPTY_DATATABLE_PREFERENCES)
    }

    const accessor = (key: string): Observable<string> =>
      this._prefsAccessor ? this._prefsAccessor.get(key) : of(JSON.stringify(EMPTY_DATATABLE_PREFERENCES))

    return refreshSubject.pipe(
      startWith(undefined),
      switchMap(() => accessor(prefKey).pipe(
        map(v => {
          if (!v) {
            return null
          }

          // TODO: Add a schema validator and migration tool to avoid parsing issues.
          try {
            // return JSON.parse(v) as TheSeamDatatablePreferences
            return this._descerializePreferences(v)
          } catch (error) {
            if (isDevMode()) {
              console.error(error)
            }
            return null
          }
        }),
        map(v => notNullOrUndefined(v) ? v : EMPTY_DATATABLE_PREFERENCES),
        tap(v => console.log('preferences$', v)),
        tap(() => {
          this._pending = false
          this._loaded = true
        })
      )),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
  }

  public refresh(preferenceKey: string): void {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    if (prefs) {
      this._pending = true
      prefs.refresh.next()
    }
  }

  // TODO: Improve this updating to be more generic, so we can quickly add
  // edits for different preference schema's.
  //
  // TODO: Decide if a send queue/merging of pending queue is needed to avoid
  // out of order updates. This shouldn't be an issue, with how fast preferences
  // will most likely be changing, but it could happen in situations, such as
  // network issues.
  // public setColumnPreference(preferenceKey: string, column: TheSeamDatatablePreferencesColumn): void {
  //   if (!this._prefsAccessor) {
  //     return
  //   }

  //   this._pending = true
  //   this.preferences(preferenceKey).pipe(
  //     map(prefs => {
  //       // Making the preferences immutable may not be necessary, but for now
  //       // this obj->str->obj will work as a naive clone.
  //       const columns = JSON.parse(JSON.stringify(prefs.columns || []))
  //       const _colPref = columns.find((c: any) => c.prop === column.prop)
  //       // console.log('has', _colPref)
  //       if (_colPref) {
  //         // console.log('hasProperty(column, "width"))', hasProperty(column, 'width'))
  //         if (hasProperty(column, 'width')) { _colPref.width = column.width }
  //         if (hasProperty(column, 'canAutoResize')) { _colPref.canAutoResize = column.canAutoResize }
  //         if (hasProperty(column, 'hidden')) { _colPref.hidden = column.hidden }
  //       } else {
  //         columns.push({ ...column })
  //       }
  //       const newPrefs: TheSeamDatatablePreferences = { ...prefs, columns }
  //       return newPrefs
  //     }),
  //     // tap(v => console.log('newPrefs', v)),
  //     take(1),
  //     switchMap(newPrefs => this._prefsAccessor
  //       ? this._prefsAccessor.update(preferenceKey, JSON.stringify(newPrefs))
  //       : of(newPrefs)
  //     ),
  //     tap(() => this.refresh(preferenceKey))
  //   )
  //   .subscribe()
  // }

  public setAlterations(preferenceKey: string, alterations: ColumnsAlterationState[]): void {
      if (!this._prefsAccessor) {
        return
      }

      this._pending = true
      this.preferences(preferenceKey).pipe(
        map(prefs => {
          // Making the preferences immutable may not be necessary, but for now
          // this obj->str->obj will work as a naive clone.
          // const columns = JSON.parse(JSON.stringify(prefs.columns || []))
          // const _colPref = columns.find((c: any) => c.prop === column.prop)
          // // console.log('has', _colPref)
          // if (_colPref) {
          //   // console.log('hasProperty(column, "width"))', hasProperty(column, 'width'))
          //   if (hasProperty(column, 'width')) { _colPref.width = column.width }
          //   if (hasProperty(column, 'canAutoResize')) { _colPref.canAutoResize = column.canAutoResize }
          //   if (hasProperty(column, 'hidden')) { _colPref.hidden = column.hidden }
          // } else {
          //   columns.push({ ...column })
          // }
          // const newPrefs: TheSeamDatatablePreferences = { ...prefs, columns }
          // return newPrefs

          const newPrefs: TheSeamDatatablePreferences = {
            ...EMPTY_DATATABLE_PREFERENCES,
            alterations
          }
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

  // public withColumnPreferences<T>(preferenceKey: string, columns: T[]): Observable<T[]> {
  //   return this.preferences(preferenceKey).pipe(
  //     startWith(EMPTY_DATATABLE_PREFERENCES),
  //     map(preferences => preferences && preferences.columns
  //       ? withStoredColumnInfo(columns, preferences.columns) as T[]
  //       : columns
  //     )
  //   )
  // }

  private _descerializePreferences(serialized: string): TheSeamDatatablePreferences {
    const prefs = JSON.parse(serialized)

    // TODO: Implement migration

    return prefs
  }

}
