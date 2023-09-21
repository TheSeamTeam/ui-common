import { Inject, Injectable, Optional } from '@angular/core'
import { Observable, of } from 'rxjs'
import { map, take, tap } from 'rxjs/operators'

import { TheSeamPreferencesAccessor, TheSeamPreferencesBase, TheSeamPreferencesManagerService } from '@theseam/ui-common/services'
import { THESEAM_WIDGET_PREFERENCES_ACCESSOR } from './widget-preferences.token'
import { CURRENT_WIDGET_PREFERENCES_VERSION, EMPTY_WIDGET_PREFERENCES, TheSeamWidgetPreferences } from './widget-preferences.models'

type TheSeamWidgetPreferencesPatch = Omit<TheSeamWidgetPreferences, 'version'>

// TODO: Rethink this. I originally implemented this to be shared widget's then
// changed it to be per widget, for the accessor injection.

// @Injectable({ providedIn: 'root' })
@Injectable()
export class WidgetPreferencesService {

  private _pendingPatches: { [preferencesKey: string]: TheSeamWidgetPreferencesPatch[] } = { }

  constructor(
    private readonly _preferencesManager: TheSeamPreferencesManagerService,
    @Optional() @Inject(THESEAM_WIDGET_PREFERENCES_ACCESSOR) private _prefsAccessor?: TheSeamPreferencesAccessor
  ) { }

  public isPatchPending(preferenceKey: string): boolean {
    return this._pendingPatches[preferenceKey] && this._pendingPatches[preferenceKey].length > 0
  }

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

  public patchPreferences(preferenceKey: string, preferences: TheSeamWidgetPreferencesPatch): void {
    if (!this._prefsAccessor) {
      return
    }

    if (!this._pendingPatches[preferenceKey]) {
      this._pendingPatches[preferenceKey] = []
    }

    if (this._pendingPatches[preferenceKey].length > 0) {
      this._pendingPatches[preferenceKey].push(preferences)
      return
    }

    this._pendingPatches[preferenceKey].push(preferences)

    this.preferences(preferenceKey).pipe(
      take(1),
      map(prefs => {
        const pendingPatches = this._pendingPatches[preferenceKey]
        this._pendingPatches[preferenceKey] = []
        const newPrefs: TheSeamWidgetPreferences = pendingPatches.reduce((acc, patch) => {
          return { ...acc, ...patch }
        }, prefs) as TheSeamWidgetPreferences // Typescript isn't recognizing that 'version' is included in the initial value.

        if (!this._isValidPreferences(newPrefs)) {
          throw Error(`Attempted to patch preferences for key '${preferenceKey}' with invalid preferences.`)
        }

        this._preferencesManager.update(preferenceKey, newPrefs)
      }),
      tap(() => this.refresh(preferenceKey)),
    ).subscribe()
  }

  private _isValidPreferences(prefs: TheSeamPreferencesBase): prefs is TheSeamWidgetPreferences {
    return prefs.version === CURRENT_WIDGET_PREFERENCES_VERSION
  }

}
