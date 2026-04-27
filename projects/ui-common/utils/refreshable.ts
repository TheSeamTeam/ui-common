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

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_opts: RefreshableOptions<T>) {
    // Implementation grows incrementally across tasks A2–A9.
  }

  public refresh(): void {
    // Implementation in Task A4.
  }
}
