import { Inject, Injectable, Optional } from '@angular/core'
import { Observable, of } from 'rxjs'
import { filter, map, switchMap, take, tap } from 'rxjs/operators'

import {
  TheSeamPreferencesAccessor,
  TheSeamPreferencesBase,
  TheSeamPreferencesManagerService,
} from '@theseam/ui-common/services'

import {
  CURRENT_DATATABLE_PREFERENCES_VERSION,
  EMPTY_DATATABLE_PREFERENCES,
  TheSeamDatatablePreferences,
  TheSeamDatatablePreferencesDisplay,
} from '../models/preferences'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import { ColumnsAlterationState } from '../models/columns-alteration'

@Injectable({
  providedIn: 'root',
})
export class DatatablePreferencesService {
  // TODO: Remove the need for this internal pending flag. I only kept it for
  // backwards compatibility, until better tests are added to make sure if isn't
  // neccessary anymore.

  /**
   * Used to prevent multiple updates from happening at the same time, but it is not per key.
   */
  private _pending = false

  /** Last value written for each key whose writes have not all finished. */
  private readonly _unsaved = new Map<
    string,
    { prefs: TheSeamDatatablePreferences; writes: number }
  >()

  constructor(
    private readonly _preferencesManager: TheSeamPreferencesManagerService,
    @Optional()
    @Inject(THESEAM_DATATABLE_PREFERENCES_ACCESSOR)
    private _prefsAccessor?: TheSeamPreferencesAccessor,
  ) {}

  public isPending(preferenceKey: string): boolean {
    return this._pending || this._preferencesManager.isPending(preferenceKey)
  }

  public isLoaded(preferenceKey: string): boolean {
    if (this._pending) {
      return false
    }
    return this._preferencesManager.isLoaded(preferenceKey)
  }

  public preferences(
    preferenceKey: string,
  ): Observable<TheSeamDatatablePreferences> {
    if (!this._prefsAccessor) {
      return of(JSON.parse(JSON.stringify(EMPTY_DATATABLE_PREFERENCES)))
    }

    return this._preferencesManager
      .preferences(
        preferenceKey,
        this._prefsAccessor,
        EMPTY_DATATABLE_PREFERENCES,
      )
      .pipe(
        map((prefs) => {
          if (this._isValidDatatablePreferences(prefs)) {
            return prefs
          }
          throw Error(
            `Preferences for key '${preferenceKey}' is not a valid datatable preferences.`,
          )
        }),
      )
  }

  public refresh(preferenceKey: string): void {
    this._preferencesManager.refresh(preferenceKey)
  }

  public setAlterations(
    preferenceKey: string,
    alterations: ColumnsAlterationState[],
  ): void {
    this._update(preferenceKey, (prefs) => ({ ...prefs, alterations }))
  }

  public setDisplay(
    preferenceKey: string,
    display: TheSeamDatatablePreferencesDisplay,
  ): void {
    this._update(preferenceKey, (prefs) => ({
      ...prefs,
      display: { ...prefs.display, ...display },
    }))
  }

  /**
   * Every write goes through here so that one kind of change does not
   * overwrite another. While a write is in flight the cached preferences are
   * stale, so later writes build on the last value written instead.
   */
  private _update(
    preferenceKey: string,
    change: (prefs: TheSeamDatatablePreferences) => TheSeamDatatablePreferences,
  ): void {
    if (!this._prefsAccessor) {
      return
    }

    this._pending = true
    this.preferences(preferenceKey)
      .pipe(
        // After a refresh the cache replays the old value until the new one
        // loads.
        filter(() => this._preferencesManager.isLoaded(preferenceKey)),
        take(1),
        map((prefs) => {
          const unsaved = this._unsaved.get(preferenceKey)
          const newPrefs = change({
            ...EMPTY_DATATABLE_PREFERENCES,
            ...(unsaved?.prefs ?? prefs),
          })
          this._unsaved.set(preferenceKey, {
            prefs: newPrefs,
            writes: (unsaved?.writes ?? 0) + 1,
          })
          this._pending = false
          return newPrefs
        }),
        switchMap((newPrefs) =>
          this._prefsAccessor
            ? this._prefsAccessor.update(
                preferenceKey,
                JSON.stringify(newPrefs),
              )
            : of(newPrefs),
        ),
        tap(() => {
          const unsaved = this._unsaved.get(preferenceKey)
          if (unsaved && --unsaved.writes === 0) {
            this._unsaved.delete(preferenceKey)
          }
          this.refresh(preferenceKey)
        }),
      )
      .subscribe()
  }

  private _isValidDatatablePreferences(
    prefs: TheSeamPreferencesBase,
  ): prefs is TheSeamDatatablePreferences {
    return prefs.version === CURRENT_DATATABLE_PREFERENCES_VERSION
  }
}
