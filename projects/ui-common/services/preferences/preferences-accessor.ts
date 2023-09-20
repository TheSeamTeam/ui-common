import { Observable } from 'rxjs'

export interface TheSeamPreferencesAccessor {

  /**
   * Gets a preference.
   */
  get(name: string): Observable<string>

  /**
   * Update a preference.
   */
  update(name: string, value: string): Observable<string>

  /**
   * Delete a preference.
   */
  delete(name: string): Observable<boolean>

}
