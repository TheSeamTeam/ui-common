import { inject, Injectable, InjectionToken } from '@angular/core'
import { Observable, of } from 'rxjs'

import { TheSeamDatatablePreferencesAccessor } from '../models/preferences-accessor'

export interface DatatablePreferencesActions {
  get?: any
  update?: any
  delete?: any
}

const DATATABLE_PREFS_ACTIONS = new InjectionToken<DatatablePreferencesActions>(
  'DATATABLE_PREFS_ACTIONS',
)

const ACCESSOR_PREFIX = 'story-pref'

@Injectable()
export class DatatablePreferencesAccessorLocalService
  implements TheSeamDatatablePreferencesAccessor
{
  private readonly actions = inject(DATATABLE_PREFS_ACTIONS, { optional: true })

  /**
   * Gets a preference.
   */
  public get(name: string): Observable<string> {
    console.log('[get]', name, this.actions)
    if (this.actions?.get) {
      this.actions.get(name)
    }
    return of(localStorage.getItem(`${ACCESSOR_PREFIX}-${name}`) || '{}')
  }

  /**
   * Update a preference.
   */
  public update(name: string, value: string): Observable<string> {
    console.log('update', name, this.actions)
    if (this.actions?.update) {
      this.actions.update(name, value)
    }
    localStorage.setItem(`${ACCESSOR_PREFIX}-${name}`, value)
    return this.get(name)
  }

  /**
   * Delete a preference.
   */
  public delete(name: string): Observable<boolean> {
    console.log('delete', name, this.actions)
    if (this.actions?.delete) {
      this.actions.delete(name)
    }
    localStorage.removeItem(`${ACCESSOR_PREFIX}-${name}`)
    return of(true)
  }
}

export function provideDatatablePreferencesAccessorLocalActions(
  actions: DatatablePreferencesActions,
) {
  return {
    provide: DATATABLE_PREFS_ACTIONS,
    useValue: actions,
  }
}
