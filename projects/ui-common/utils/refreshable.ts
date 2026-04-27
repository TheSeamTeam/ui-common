import { BehaviorSubject, EMPTY, merge, Observable, Subject } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'

export interface RefreshableOptions<T> {
  action: () => Observable<T>
  invalidate$?: Observable<unknown>
  poll$?: Observable<unknown>
}

const NO_VALUE: unique symbol = Symbol('refreshable.no-value')
type Cached<T> = T | typeof NO_VALUE

export class Refreshable<T> {
  private readonly _refresh$ = new Subject<void>()
  private readonly _cache$ = new BehaviorSubject<Cached<T>>(NO_VALUE)
  private readonly _loading$ = new BehaviorSubject<boolean>(false)
  private _dataSubCount = 0

  public readonly loading$: Observable<boolean> = this._loading$.pipe(
    distinctUntilChanged(),
  )

  public readonly initialized$: Observable<boolean> = this._cache$.pipe(
    map((v) => v !== NO_VALUE),
    distinctUntilChanged(),
  )

  public readonly data$: Observable<T>

  constructor(opts: RefreshableOptions<T>) {
    const { action } = opts

    const driver$ = merge(this._refresh$, EMPTY).pipe(
      startWith(undefined as unknown),
      tap(() => this._loading$.next(true)),
      switchMap(() => action()),
      tap({
        next: (v) => {
          this._cache$.next(v)
          this._loading$.next(false)
        },
        error: () => this._loading$.next(false),
      }),
      share({
        resetOnRefCountZero: true,
        resetOnComplete: true,
        resetOnError: true,
      }),
    )

    this.data$ = new Observable<T>((subscriber) => {
      this._dataSubCount++
      const driverSub = driver$.subscribe({
        error: (e) => subscriber.error(e),
      })
      const cacheSub = this._cache$
        .pipe(filter((v): v is T => v !== NO_VALUE))
        .subscribe(subscriber)
      return () => {
        cacheSub.unsubscribe()
        driverSub.unsubscribe()
        this._dataSubCount--
        if (this._dataSubCount === 0) {
          this._cache$.next(NO_VALUE)
          this._loading$.next(false)
        }
      }
    })
  }

  public refresh(): void {
    this._refresh$.next()
  }
}
