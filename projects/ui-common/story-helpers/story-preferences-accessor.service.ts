import { Injectable } from '@angular/core'
import { TheSeamPreferencesAccessor } from '@theseam/ui-common/services'
import { Observable, of } from 'rxjs'

const ACCESSOR_PREFIX = 'story-pref'

@Injectable()
export class StoryPreferencesAccessorService implements TheSeamPreferencesAccessor {

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
