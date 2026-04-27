import { defer, Observable, of } from 'rxjs'
import { switchMap, take } from 'rxjs/operators'

export interface RefreshableOptions<T> {
  action: () => Observable<T>
  invalidate$?: Observable<unknown>
  poll$?: Observable<unknown>
}

export class Refreshable<T> {
  public readonly data$: Observable<T>
  public readonly loading$: Observable<boolean> = new Observable<boolean>()
  public readonly initialized$: Observable<boolean> = new Observable<boolean>()

  constructor(opts: RefreshableOptions<T>) {
    const { action } = opts
    this.data$ = defer(() =>
      of(undefined).pipe(
        switchMap(() => action()),
        take(1),
      ),
    )
  }

  public refresh(): void {
    // Implementation in Task A4.
  }
}
