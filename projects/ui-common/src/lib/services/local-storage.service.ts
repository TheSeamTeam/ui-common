import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

import * as localStorageMemory from 'localstorage-memory'

// NOTE: Temporary localStorage polyfill just to get the app running without localStorage for now.
const localStorage: Storage = 'localStorage' in window && window.localStorage != null ? window.localStorage : localStorageMemory

export interface ILocalStorageService {
  select(key: string, defaultValue: any): Observable<any>
  get(key: string, defaultValue: any): any
  set(key: string, value: any): void
  remove(key: string): void
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements ILocalStorageService {
  protected subjects: { [key: string]: BehaviorSubject<any> } = {}

  /** This is only here for testing/debugging. */
  private _localStorage = localStorage

  /**
   * Observe a localStorage item.
   *
   * NOTE: Only emits changes if the item is changed with the set method of this
   * class instance.
   */
  select(key: string, defaultValue: any = null): Observable<any> {
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
  get(key: string, defaultValue: any = null): any {
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
  set(key: string, value: any): void {
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
