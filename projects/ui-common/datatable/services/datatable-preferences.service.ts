import { Inject, Injectable, Optional } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map, switchMap, take, tap } from 'rxjs/operators'

import { TheSeamPreferencesAccessor, TheSeamPreferencesBase, TheSeamPreferencesManagerService } from '@theseam/ui-common/services'

import { CURRENT_DATATABLE_PREFERENCES_VERSION, EMPTY_DATATABLE_PREFERENCES, TheSeamDatatablePreferences } from '../models/preferences'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import { ColumnsAlterationState } from '../models/columns-alteration'

@Injectable({
  providedIn: 'root'
})
export class DatatablePreferencesService {

  // TODO: Remove the need for this internal pending flag. I only kept it for
  // backwards compatibility, until better tests are added to make sure if isn't
  // neccessary anymore.

  /**
   * Used to prevent multiple updates from happening at the same time, but it is not per key.
   */
  private _pending = false

  constructor(
    private readonly _preferencesManager: TheSeamPreferencesManagerService,
    @Optional() @Inject(THESEAM_DATATABLE_PREFERENCES_ACCESSOR) private _prefsAccessor?: TheSeamPreferencesAccessor
  ) { }

  public isPending(preferenceKey: string): boolean {
    return this._pending || this._preferencesManager.isPending(preferenceKey)
  }

  public isLoaded(preferenceKey: string): boolean {
    if (this._pending) {
      return false
    }
    return this._preferencesManager.isLoaded(preferenceKey)
  }

  public preferences(preferenceKey: string): Observable<TheSeamDatatablePreferences> {
    if (!this._prefsAccessor) {
      return of(JSON.parse(JSON.stringify(EMPTY_DATATABLE_PREFERENCES)))
    }

    return this._preferencesManager.preferences(preferenceKey, this._prefsAccessor, EMPTY_DATATABLE_PREFERENCES).pipe(
      map(prefs => {
        if (this._isValidDatatablePreferences(prefs)) {
          return prefs
        }
        throw Error(`Preferences for key '${preferenceKey}' is not a valid datatable preferences.`)
      })
    )
  }

  public refresh(preferenceKey: string): void {
    this._preferencesManager.refresh(preferenceKey)
  }

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
          this._pending = false
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

  private _isValidDatatablePreferences(prefs: TheSeamPreferencesBase): prefs is TheSeamDatatablePreferences {
    return prefs.version === CURRENT_DATATABLE_PREFERENCES_VERSION
  }

}
