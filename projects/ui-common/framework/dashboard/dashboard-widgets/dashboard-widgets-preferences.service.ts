import { Inject, Injectable, isDevMode, Optional } from '@angular/core'
import { Observable, of, Subject } from 'rxjs'
import { auditTime, map, mapTo, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators'

import { hasProperty } from '@theseam/ui-common/utils'

import {
  IDashboardWidgetItemLayout,
  IDashboardWidgetItemLayoutPreference,
  IDashboardWidgetsItem,
  IDashboardWidgetsItemDef,
  IDashboardWidgetsItemSerialized,
  IDashboardWidgetsPreferences
} from './dashboard-widgets-item'
import type { ITheSeamDashboardWidgetsPreferencesAccessor } from './dashboard-widgets-preferences-accessor'
import { THESEAM_DASHBOARD_WIDGETS_PREFERENCES_ACCESSOR } from './dashboard-widgets-preferences-accessor-token'

export interface IDashboardWidgetsPreferencesMapRecord {
  observable: Observable<IDashboardWidgetsPreferences>
  refresh: Subject<void>
}

// TODO: This needs a unit test to make sure it will not cause a race condition
// if update is called faster than the previous can respond.
//
// The ideal approach I am thinking, without steping through the process too
// thoroughly is to hold the new data emit until all pending updates are done.
// Any pending updates other than the most recently requested will be ignored
// and just wait on the most recent, and if already running it should be
// canceled if possible. Also, incase something happens that causes the new data
// emissions to get held up too long, there could be a threshold time that the
// new data can be held up.

/**
 * Manages anything dealing with retrieving and updating dashboard widget
 * preference data from the provided accessor.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetsPreferencesService {

  private readonly _tablePrefsMap = new Map<string, IDashboardWidgetsPreferencesMapRecord>()
  // private _pending = false

  // public get pending() { return this._pending }

  constructor(
    @Optional() @Inject(THESEAM_DASHBOARD_WIDGETS_PREFERENCES_ACCESSOR) private _prefsAccessor?: ITheSeamDashboardWidgetsPreferencesAccessor
  ) { }

  public preferences(preferenceKey: string): Observable<IDashboardWidgetsPreferences> {
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

  private _createObservable(refreshSubject: Subject<void>, prefKey: string): Observable<IDashboardWidgetsPreferences> {
    if (!this._prefsAccessor) {
      return of({})
    }

    const accessor = (key: string): Observable<string> =>
      this._prefsAccessor ? this._prefsAccessor.get(key) : of('{}')

    return refreshSubject.pipe(
      startWith({}),
      // tap(() => console.log('Start requesting: ', prefKey)),
      switchMap(() => accessor(prefKey).pipe(
        map(v => {
          if (!v) {
            return null
          }

          // TODO: Add a schema validator and migration tool to avoid parsing issues.
          try {
            return JSON.parse(v) as IDashboardWidgetsPreferences
          } catch (error) {
            if (isDevMode()) {
              // eslint-disable-next-line no-console
              console.error(error)
            }
            return null
          }
        }),
        map(v => v || {}),
        // tap(v => console.log('preferences$', v))
        // tap(v => this._pending = false)
      )),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  public refresh(preferenceKey: string): Observable<void> {
    const prefs = this._tablePrefsMap.get(preferenceKey)
    if (prefs) {
      // this._pending = true
      // prefs.refresh.next()
      return prefs.observable.pipe(
        // tap(() => prefs.refresh.next()),
        tap(() => setTimeout(() => { prefs.refresh.next() }, 0)),
        mapTo(undefined),
        take(1),
        // tap(() => console.log('Done refreshing: ', preferenceKey)),
      )
    }

    return of(undefined)
  }

  public selectLayout(preferenceKey: string, layoutName: string): Observable<IDashboardWidgetItemLayoutPreference | undefined> {
    return this.preferences(preferenceKey).pipe(
      map(prefs => (prefs.layouts || []).find(l => l.name === layoutName))
    )
  }

  // TODO: Improve this updating to not be more generic, so we can quickly add
  // edits for different preference schema's.
  //
  // TODO: Decide if a send queue/merging of pending queue is needed to avoid
  // out of order updates. This shouldn't be an issue, with how fast preferences
  // will most likely be changing, but it could happen in situations, such as
  // network issues.
  public updateLayout(preferenceKey: string, layout: IDashboardWidgetItemLayout): Observable<void> {
    if (!this._prefsAccessor) {
      return of(undefined)
    }

    if (!hasProperty(layout, 'name')) {
      throw Error(`Unable to save layout preference. 'name' is required for a layout preference.`)
    }

    const _layout = this.toSerializeableLayout(layout)

    // this._pending = true
    return this.preferences(preferenceKey).pipe(
      map(prefs => {
        // Making the preferences immutable may not be necessary, but for now
        // this obj->str->obj will work as a naive clone.
        const layouts = JSON.parse(JSON.stringify(prefs.layouts || []))
        const _layoutPref = layouts.find((c: any) => c.name === _layout.name)
        // console.log('has', _layoutPref)
        if (_layoutPref) {
          if (hasProperty(_layout, 'name')) { _layoutPref.name = _layout.name }
          if (hasProperty(_layout, 'label')) { _layoutPref.label = _layout.label }
          if (hasProperty(_layout, 'items')) { _layoutPref.items = _layout.items }
        } else {
          layouts.push({ ..._layout })
        }
        const newPrefs: IDashboardWidgetsPreferences = { ...prefs, layouts }
        return newPrefs
      }),
      // tap(v => console.log('newPrefs', v)),
      take(1),
      switchMap(newPrefs => this._prefsAccessor
        ? this._prefsAccessor.update(preferenceKey, JSON.stringify(newPrefs))
        : of(newPrefs)
      ),
      switchMap(() => this.refresh(preferenceKey).pipe(mapTo(undefined)))
    )
    // .subscribe()
  }

  public toSerializeableLayout(layout: IDashboardWidgetItemLayout): IDashboardWidgetItemLayoutPreference {
    const serialized: IDashboardWidgetItemLayoutPreference = {
      name: layout.name,
      label: layout.label,
      items: this.toSerializeableItems(layout.items as any) || []
    }
    return serialized
  }

  // public toDeserializedLayout(layout: IDashboardWidgetItemLayoutSerialized): IDashboardWidgetItemLayoutDef {
  //   // For now there is nothing to do. Eventually this should have at least
  //   // validation on the deserialized object.
  //   return layout
  // }

  /**
   * Returns the serializable widget items as objects that can be serialized to
   * a JSON string for storage.
   */
  public toSerializeableItems(widgets: IDashboardWidgetsItem[]): IDashboardWidgetsItemSerialized[] {
    const serialized: IDashboardWidgetsItemSerialized[] = []
    for (const w of widgets) {
      // if (!w.__itemDef.component || typeof w.__itemDef.component !== 'string') {
      //   console.warn(`[DashboardWidgetsService] Widget item def must have a string 'component' property to be serialized.`, w)
      //   continue
      // }
      // serialized.push({
      //   widgetId: w.widgetId,
      //   col: w.col,
      //   order: w.order,
      //   component: w.__itemDef.component
      // })

      // TODO: Remove this, it is only here for initial dev debugging.
      serialized.push({
        widgetId: w.widgetId,
        col: w.col,
        order: w.order,
        // component: w.__itemDef.component as string
      })
    }
    return serialized
  }

  // public toDeserializedItems(widgets: IDashboardWidgetsItemSerialized[]): IDashboardWidgetsItemDef[] {
  //   const items: IDashboardWidgetsItemDef[] = []
  //   for (const w of widgets) {
  //     items.push({
  //       widgetId: w.widgetId,
  //       col: w.col,
  //       order: w.order,
  //       // component: w.component
  //     })
  //   }
  //   return items
  // }

}
