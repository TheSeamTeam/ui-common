import { Injectable } from '@angular/core'
import { map, Observable } from 'rxjs'

import { TheSeamPreferencesBase } from './preferences.models'
import { TheSeamPreferencesAccessor } from './preferences-accessor'
import { TheSeamPreferencesMapRecord } from './preferences-record'

@Injectable({
  providedIn: 'root'
})
export class TheSeamPreferencesManagerService {

  private readonly _tablePrefsMap = new Map<string, TheSeamPreferencesMapRecord>()

  public preferences(
    preferenceKey: string,
    accessor: TheSeamPreferencesAccessor,
    emptyPrefs: TheSeamPreferencesBase,
  ): Observable<TheSeamPreferencesBase> {
    let prefs = this._tablePrefsMap.get(preferenceKey)

    if (prefs && !prefs.isSameAccessor(accessor)) {
      throw Error(`Preferences accessor mismatch for key '${preferenceKey}'. Changing the accessor is not supported.`)
    }

    if (prefs && !prefs.isSameEmptyPrefs(emptyPrefs)) {
      throw Error(`Preferences emptyPrefs mismatch for key '${preferenceKey}'. Changing the emptyPrefs is not supported.`)
    }

    if (!prefs) {
      prefs = new TheSeamPreferencesMapRecord(preferenceKey, accessor, emptyPrefs)
      this._tablePrefsMap.set(preferenceKey, prefs)
    }
    return prefs.observable.pipe(
      map(v => {
        // This is for assuming the accessor returned an empty object, as a
        // default for a missing preference. Instead of throwing an error, we
        // return a valid empty preferences.
        //
        // NOTE: May remove this, when a more generic preferences implementation
        // is finished.
        if (Object.keys(v).length === 0) {
          return emptyPrefs
        }

        return v
      }),
    )
  }

  public update(preferenceKey: string, value: TheSeamPreferencesBase): void {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    if (prefs) {
      prefs.update(value)
    }
  }

  public delete(preferenceKey: string): void {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    if (prefs) {
      prefs.delete()
    }
  }

  public refresh(preferenceKey: string): void {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    if (prefs) {
      prefs.refresh()
    }
  }

  public isPending(preferenceKey: string): boolean {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    return prefs ? prefs.status === 'pending' : false
  }

  public isLoaded(preferenceKey: string): boolean {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    return prefs ? prefs.status === 'loaded' : false
  }

}
