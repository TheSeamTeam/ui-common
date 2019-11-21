import { isObservable, Observable, Subscriber, Subscription } from 'rxjs'

class IntervalTimer {

  private _intervalTime: number
  private _intervalId: number | null = null

  constructor(
    private _callback: () => void,
    intervalTime: number,
    startOnInit: boolean = true
  ) {
    this._intervalTime = intervalTime
    if (startOnInit) {
      this.start()
    }
  }

  set intervalTime(time: number) {
    this._intervalTime = time
  }

  public start(): void {
    if (this._intervalId === null) {
      this._intervalId = window.setInterval(() => {
        this._callback()
      }, this._intervalTime)
    }
  }

  public stop(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }
  }

  public reset(newIntervalTime?: number): void {
    if (newIntervalTime) {
      this.intervalTime = newIntervalTime
    }
    this.stop()
    this.start()
  }

}

export type PollingActionFn<R> = () => R | Observable<R>

// tslint:disable:no-inferrable-types
export class PollingTickerOptions {
  emitOnInit?: boolean = true
}
// tslint:enable:no-inferrable-types

// TODO: Simplify complexity.

/**
 * Call an action and emits the result to its subscriber on an interval or when
 * ticker emits. When the ticker emits, the interval time will reset.
 *
 * When subscribed to, the action will be called and emitted right away unless
 * the `emitOnInit` option is set to false.
 */
export function pollingTicker<R>(
  action: PollingActionFn<R>,
  pollingInterval?: number,
  ticker?: Observable<number | void>,
  options?: PollingTickerOptions
): Observable<R> {
  return new Observable((subscriber: Subscriber<R>) => {
    const _opts = { ...(new PollingTickerOptions()), ...(options || {}) }

    let timer: IntervalTimer | null = null
    let actionSub: Subscription | null = null
    let tickerSub: Subscription | null = null

    try {
      const handleAction = () => {
        if (timer) { timer.stop() }

        const actionResult = action()

        if (isObservable(actionResult)) {
          if (actionSub) {
            actionSub.unsubscribe()
          }
          actionSub = actionResult.subscribe(
            (v: R) => { subscriber.next(v); if (timer) { timer.reset() } },
            (err) => { subscriber.error(err) },
            () => {
              actionSub = null
              if (timer) { timer.start() }
            }
          )
        } else {
          subscriber.next(actionResult)
        }
        if (timer) { timer.start() }
      }

      if (_opts.emitOnInit) {
        handleAction()
      }

      if (pollingInterval) {
        timer = new IntervalTimer(() => {
          handleAction()
        }, pollingInterval)
      }

      if (ticker) {
        tickerSub = ticker.subscribe((newPollingInterval?: number) => {
          if (newPollingInterval && timer) {
            timer.stop()
            if (newPollingInterval) {
              timer.intervalTime = newPollingInterval
            }
          }
          handleAction()
          if (timer) { timer.reset() }
        })
      }
    } catch (err) {
      subscriber.error(err)
    }

    return () => {
      if (timer) {
        timer.stop()
      }
      if (actionSub) {
        actionSub.unsubscribe()
      }
      if (tickerSub) {
        tickerSub.unsubscribe()
      }
    }
  })
}
