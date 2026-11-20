import { Injectable, isDevMode } from '@angular/core'
import { defer, Observable, of, Subject, throwError } from 'rxjs'
import { filter, map, take, timeout } from 'rxjs/operators'

import { TheSeamGuideTargetTimeoutError } from '../models/guide-errors'

/**
 * Tracks elements registered by `[seamGuideTarget]` so a guide can await a
 * target that does not exist yet, and notice one that disappears.
 */
@Injectable({ providedIn: 'root' })
export class TheSeamGuideTargetRegistry {
  private readonly _targets = new Map<string, Element[]>()
  private readonly _changes = new Subject<string>()

  /** Emits the target name whenever its registrations change. */
  readonly changes$: Observable<string> = this._changes.asObservable()

  register(name: string, element: Element): void {
    const list = this._targets.get(name) ?? []
    if (!list.includes(element)) {
      list.push(element)
    }
    this._targets.set(name, list)

    if (isDevMode() && list.filter((e) => e.isConnected).length > 1) {
      console.warn(
        `TheSeamGuideTargetRegistry: more than one connected element is` +
          ` registered as guide target "${name}". The most recently registered` +
          ` one will be used, which may not be the one you meant.`,
      )
    }

    this._changes.next(name)
  }

  unregister(name: string, element: Element): void {
    const list = this._targets.get(name)
    if (!list) {
      return
    }
    const index = list.indexOf(element)
    if (index === -1) {
      return
    }
    list.splice(index, 1)
    if (list.length === 0) {
      this._targets.delete(name)
    }
    this._changes.next(name)
  }

  /** The most recently registered element for `name` that is still in the DOM. */
  resolve(name: string): Element | null {
    const list = this._targets.get(name)
    if (!list) {
      return null
    }
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].isConnected) {
        return list[i]
      }
    }
    return null
  }

  /** Emits as soon as `name` resolves. Errors with a timeout error otherwise. */
  waitFor(name: string, timeoutMs: number): Observable<Element> {
    return defer(() => {
      const existing = this.resolve(name)
      if (existing !== null) {
        return of(existing)
      }
      return this._changes.pipe(
        filter((changed) => changed === name),
        map(() => this.resolve(name)),
        filter((el): el is Element => el !== null),
        take(1),
        timeout({
          first: timeoutMs,
          with: () =>
            throwError(() => new TheSeamGuideTargetTimeoutError(name)),
        }),
      )
    })
  }
}
