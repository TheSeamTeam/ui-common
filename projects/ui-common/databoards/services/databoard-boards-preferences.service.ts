import { Inject, Injectable, Optional } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map, switchMap, take, tap } from 'rxjs/operators'

import { TheSeamPreferencesAccessor, TheSeamPreferencesBase, TheSeamPreferencesManagerService } from '@theseam/ui-common/services'

import { CURRENT_DATABOARD_LIST_PREFERENCES_VERSION, EMPTY_DATABOARD_LIST_PREFERENCES, TheSeamDataboardListPreferences } from '../models/preferences'
import { BoardsAlterationState } from '../models/board-alteration'
import { THESEAM_DATABOARDLIST_PREFERENCES_ACCESSOR } from '../tokens/databoard-preferences-accessor'

@Injectable({
  providedIn: 'root'
})
export class DataboardBoardsPreferencesService {

  // TODO: Remove the need for this internal pending flag. I only kept it for
  // backwards compatibility, until better tests are added to make sure if isn't
  // neccessary anymore.

  /**
   * Used to prevent multiple updates from happening at the same time, but it is not per key.
   */
  private _pending = false

  constructor(
    private readonly _preferencesManager: TheSeamPreferencesManagerService,
    @Optional() @Inject(THESEAM_DATABOARDLIST_PREFERENCES_ACCESSOR) private _prefsAccessor?: TheSeamPreferencesAccessor
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

  public preferences(preferenceKey: string): Observable<TheSeamDataboardListPreferences> {
    if (!this._prefsAccessor) {
      return of(JSON.parse(JSON.stringify(EMPTY_DATABOARD_LIST_PREFERENCES)))
    }

    return this._preferencesManager.preferences(preferenceKey, this._prefsAccessor, EMPTY_DATABOARD_LIST_PREFERENCES).pipe(
      map(prefs => {
        if (this._isValidDataboardListPreferences(prefs)) {
          return prefs
        }
        throw Error(`Preferences for key '${preferenceKey}' is not a valid databoard preference.`)
      })
    )
  }

  public refresh(preferenceKey: string): void {
    this._preferencesManager.refresh(preferenceKey)
  }

  public setAlterations(preferenceKey: string, alterations: BoardsAlterationState[]): void {
      if (!this._prefsAccessor) {
        return
      }

      this._pending = true
      this.preferences(preferenceKey).pipe(
        map(prefs => {
          const newPrefs: TheSeamDataboardListPreferences = {
            ...EMPTY_DATABOARD_LIST_PREFERENCES,
            alterations
          }
          this._pending = false
          return newPrefs
        }),
        take(1),
        switchMap(newPrefs => this._prefsAccessor
          ? this._prefsAccessor.update(preferenceKey, JSON.stringify(newPrefs))
          : of(newPrefs)
        ),
        tap(() => this.refresh(preferenceKey))
      )
      .subscribe()
  }

  private _isValidDataboardListPreferences(prefs: TheSeamPreferencesBase): prefs is TheSeamDataboardListPreferences {
    return prefs.version === CURRENT_DATABOARD_LIST_PREFERENCES_VERSION
  }

}
