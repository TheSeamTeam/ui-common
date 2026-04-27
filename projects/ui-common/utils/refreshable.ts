import { Observable } from 'rxjs'

export interface RefreshableOptions<T> {
  action: () => Observable<T>
  invalidate$?: Observable<unknown>
  poll$?: Observable<unknown>
}

export class Refreshable<T> {
  public readonly data$: Observable<T> = new Observable<T>()
  public readonly loading$: Observable<boolean> = new Observable<boolean>()
  public readonly initialized$: Observable<boolean> = new Observable<boolean>()

  constructor(opts: RefreshableOptions<T>) {
    void opts
  }

  public refresh(): void {
    // Implementation in Task A4.
  }
}
