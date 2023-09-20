import { Inject, Injectable, Optional } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map, switchMap, take, tap } from 'rxjs/operators'

import { TheSeamPreferencesAccessor, TheSeamPreferencesBase, TheSeamPreferencesManagerService } from '@theseam/ui-common/services'
import { THESEAM_WIDGET_PREFERENCES_ACCESSOR } from './widget-preferences.token'
import { CURRENT_WIDGET_PREFERENCES_VERSION, EMPTY_WIDGET_PREFERENCES, TheSeamWidgetPreferences } from './widget-preferences.models'

@Injectable({
  providedIn: 'root'
})
export class WidgetPreferencesService {

  constructor(
    private readonly _preferencesManager: TheSeamPreferencesManagerService,
    @Optional() @Inject(THESEAM_WIDGET_PREFERENCES_ACCESSOR) private _prefsAccessor?: TheSeamPreferencesAccessor
  ) { }

  public isPending(preferenceKey: string): boolean {
    return this._preferencesManager.isPending(preferenceKey)
  }

  public isLoaded(preferenceKey: string): boolean {
    return this._preferencesManager.isLoaded(preferenceKey)
  }

  public preferences(preferenceKey: string): Observable<TheSeamWidgetPreferences> {
    if (!this._prefsAccessor) {
      return of(JSON.parse(JSON.stringify(EMPTY_WIDGET_PREFERENCES)))
    }

    return this._preferencesManager.preferences(preferenceKey, this._prefsAccessor, EMPTY_WIDGET_PREFERENCES).pipe(
      map(prefs => {
        if (this._isValidPreferences(prefs)) {
          return prefs
        }
        throw Error(`Preferences for key '${preferenceKey}' is not a valid widget preferences.`)
      })
    )
  }

  public refresh(preferenceKey: string): void {
    this._preferencesManager.refresh(preferenceKey)
  }

  // public setAlterations(preferenceKey: string, alterations: ColumnsAlterationState[]): void {
  //     if (!this._prefsAccessor) {
  //       return
  //     }

  //     this._pending = true
  //     this.preferences(preferenceKey).pipe(
  //       map(prefs => {
  //         const newPrefs: TheSeamWidgetPreferences = {
  //           ...EMPTY_WIDGET_PREFERENCES,
  //           alterations
  //         }
  //         this._pending = false
  //         return newPrefs
  //       }),
  //       // tap(v => console.log('newPrefs', v)),
  //       take(1),
  //       switchMap(newPrefs => this._prefsAccessor
  //         ? this._prefsAccessor.update(preferenceKey, JSON.stringify(newPrefs))
  //         : of(newPrefs)
  //       ),
  //       tap(() => this.refresh(preferenceKey))
  //     )
  //     .subscribe()
  // }

  private _isValidPreferences(prefs: TheSeamPreferencesBase): prefs is TheSeamWidgetPreferences {
    return prefs.version === CURRENT_WIDGET_PREFERENCES_VERSION
  }

}
