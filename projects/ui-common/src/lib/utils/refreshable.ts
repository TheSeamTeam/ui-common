import { BehaviorSubject, isObservable, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, mapTo, shareReplay, skip, take, tap } from 'rxjs/operators'

import { tapFirst } from './operators/tap-first'
import { pollingTicker } from './polling-ticker'

export class Refreshable<T> {

  private _initialized = false
  private _pollingInterval = new BehaviorSubject<number>(0)
  private _ticker = new Subject<void>()
  private _pending = new BehaviorSubject<boolean>(false)

  public data$: Observable<T>
  public pending$: Observable<boolean>

  constructor(
    action: () => (T | Observable<T>),
    pollingInterval?: number
  ) {
    if (pollingInterval !== null && pollingInterval !== undefined) {
      this._pollingInterval.next(pollingInterval)
    }

    this.pending$ = this._pending.asObservable()
      .pipe(
        distinctUntilChanged(),
        shareReplay(1)
      )

    this.data$ = pollingTicker(this._actionHandler(action), pollingInterval, this._ticker)
      .pipe(
        tapFirst(() => this._initialized = true),
        shareReplay(1)
      )
  }

  get initialized(): boolean { return this._initialized }

  /**
   * Intercepts the action call to monitor pending state
   */
  private _actionHandler = (action: () => (T | Observable<T>)) => {
    return () => {
      this._pending.next(true)

      const actionResult = action()
      if (isObservable(actionResult)) {
        return actionResult.pipe(tap(() => { this._pending.next(false) }))
      } else {
        this._pending.next(true)
        return actionResult
      }
    }
  }

  /**
   * Selects the data observable
   */
  public select(refresh?: boolean): Observable<T> {
    if (refresh && this._initialized && !this._pending.value) { this._ticker.next() }
    return this.data$.pipe(shareReplay(1))
  }

  public refresh(): Observable<void> {
    let result$: Observable<any>

    if (this._initialized) {
      // TODO: Add a test and maybe refactor this to be more clear. It worked in
      //  my manual tests, but there may be some situations where this doesn't
      //  work, since the ticker isn't the only way to trigger a refresh. Right
      //  now it should be fine, but if an async operator is added to be run
      //  each time `data$` is subscribed to, then this could fail if the data
      //  emits one extra time before the ticker is triggered.
      let _polled = false
      result$ = this.data$
        .pipe(
          tap(_ => !_polled && (_polled = true) && this._ticker.next()),
          skip(1)
        )
    } else {
      result$ = this.data$
    }

    return result$
      .pipe(
        take(1),
        mapTo(undefined)
      )
  }

}
