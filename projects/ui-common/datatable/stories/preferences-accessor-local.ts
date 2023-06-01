import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { switchMap, take } from 'rxjs/operators'

import { TheSeamDatatablePreferencesAccessor } from '../models/preferences-accessor'

const ACCESSOR_PREFIX = 'story-pref'

@Injectable()
export class DatatablePreferencesAccessorLocalService implements TheSeamDatatablePreferencesAccessor {

  /**
   * Gets a preference.
   */
  public get(name: string): Observable<string> {
    // console.log('get', name)
    return of(localStorage.getItem(`${ACCESSOR_PREFIX}-${name}`) || '{}')
  }

  /**
   * Update a preference.
   */
  public update(name: string, value: string): Observable<string> {
    // console.log('update', name)
    localStorage.setItem(`${ACCESSOR_PREFIX}-${name}`, value)
    return this.get(name)
  }

  /**
   * Delete a preference.
   */
  public delete(name: string): Observable<boolean> {
    localStorage.removeItem(`${ACCESSOR_PREFIX}-${name}`)
    return of(true)
  }

}
