import { Injectable } from '@angular/core'
import { BehaviorSubject, fromEvent, Observable } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'

import * as localStorageMemory from 'localstorage-memory'

import { notNullOrUndefined } from '../utils/index'

// NOTE: Temporary localStorage polyfill just to get the app running without localStorage for now.
const localStorage: Storage = 'localStorage' in window && window.localStorage != null ? window.localStorage : localStorageMemory

export interface ILocalStorageService {
  select(key: string, defaultValue: string | null): Observable<string | null>
  get(key: string, defaultValue: string | null): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements ILocalStorageService {
  protected subjects: { [key: string]: BehaviorSubject<string | null> } = {}

  /** This is only here for testing/debugging. */
  private _localStorage = localStorage

  constructor() {
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        map(e => e.key),
        filter(notNullOrUndefined),
        tap(key => {
          const subjectValue = this.get(key)
          const storedValue = this._localStorage.getItem(key)
          if (subjectValue !== storedValue) {
            if (storedValue) {
              this.set(key, storedValue)
            } else {
              this.remove(key)
            }
          }
        }),
      )
      .subscribe()
  }

  /**
   * Observe a localStorage item.
   *
   * NOTE: Only emits changes if the item is changed with the set method of this
   * class instance.
   */
  select(key: string, defaultValue: string | null = null): Observable<string | null> {
    if (this.subjects.hasOwnProperty(key)) {
      return this.subjects[key]
    }

    if (!this._localStorage.getItem(key) && defaultValue) {
      this._localStorage.setItem(key, defaultValue)
    }

    const value = this._localStorage.getItem(key) || defaultValue

    return (this.subjects[key] = new BehaviorSubject(value))
  }

  /** Get a localStorage item. */
  get(key: string, defaultValue: string | null = null): string | null {
    if (this.subjects.hasOwnProperty(key)) {
      return this.subjects[key].value
    }

    if (!this._localStorage.getItem(key) && defaultValue) {
      this._localStorage.setItem(key, defaultValue)
    }

    const value = this._localStorage.getItem(key) || defaultValue

    return (this.subjects[key] = new BehaviorSubject(value)).value
  }

  /** Set a localStorage item. */
  set(key: string, value: string): void {
    this._localStorage.setItem(key, value)

    if (this.subjects.hasOwnProperty(key)) {
      this.subjects[key].next(value)
    }
  }

  /** Remove a localStorage item. */
  remove(key: string): void {
    this._localStorage.removeItem(key)

    if (this.subjects.hasOwnProperty(key)) {
      this.subjects[key].next(null)
    }
  }
}
