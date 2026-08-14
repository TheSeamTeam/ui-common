import { Signal } from '@angular/core'
import { Observable } from 'rxjs'

import {
  TheSeamGuideCloseReason,
  TheSeamGuideEvent,
  TheSeamGuideResult,
} from './models/guide-event'

/**
 * The contract between a {@link TheSeamGuideRef} and the session backing it.
 * `TheSeamGuideRef` delegates every member to an implementation of this
 * interface, so it never depends on `TheSeamGuideSession` directly.
 */
export interface TheSeamGuideSessionController {
  /**
   * Replays every event emitted so far for this guide, from `started`
   * onward, to each new subscriber — so attaching at any point yields the
   * complete history rather than only future events.
   */
  readonly events$: Observable<TheSeamGuideEvent>
  readonly afterClosed$: Observable<TheSeamGuideResult>
  readonly activeIndex: Signal<number>
  readonly dismissible: boolean
  next(): void
  previous(): void
  moveTo(index: number): void
  refresh(): void
  close(reason: TheSeamGuideCloseReason): void
}

/**
 * Consumer-facing handle to a running guide.
 *
 * The caller owns this ref's lifetime. A guide is not closed automatically
 * when the component that started it is destroyed — `TheSeamGuideService` is
 * `providedIn: 'root'`, so its `ngOnDestroy` only fires when the root
 * injector itself is destroyed, not on ordinary route/component teardown. A
 * component that may be destroyed before its guide naturally ends should tie
 * the ref to its own lifetime:
 *
 * ```ts
 * const ref = this._guide.start(config)
 * inject(DestroyRef).onDestroy(() => ref.close())
 * ```
 */
export class TheSeamGuideRef {
  constructor(private readonly _session: TheSeamGuideSessionController) {}

  /**
   * Replays every event emitted so far for this guide, from `started`
   * onward — a subscriber attached at any point sees the complete history,
   * not just events emitted after it subscribes. This is why subscribing
   * immediately after `start()` returns still observes `started`: `start()`
   * runs synchronously, but the event is not lost, it is replayed.
   */
  get events$(): Observable<TheSeamGuideEvent> {
    return this._session.events$
  }

  get afterClosed$(): Observable<TheSeamGuideResult> {
    return this._session.afterClosed$
  }

  get activeIndex(): Signal<number> {
    return this._session.activeIndex
  }

  /** Whether the user may dismiss this guide. Read by the service's concurrency rule. */
  get dismissible(): boolean {
    return this._session.dismissible
  }

  next(): void {
    this._session.next()
  }

  previous(): void {
    this._session.previous()
  }

  moveTo(index: number): void {
    this._session.moveTo(index)
  }

  refresh(): void {
    this._session.refresh()
  }

  /** Always works, including when `dismissible` is false. */
  close(reason: TheSeamGuideCloseReason = 'dismissed'): void {
    this._session.close(reason)
  }
}
