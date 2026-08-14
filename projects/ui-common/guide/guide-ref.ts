import { Signal } from '@angular/core'
import { Observable } from 'rxjs'

import {
  TheSeamGuideCloseReason,
  TheSeamGuideEvent,
  TheSeamGuideResult,
} from './models/guide-event'

/** What a ref is allowed to ask its session to do. Internal. */
export interface TheSeamGuideSessionController {
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

/** Consumer-facing handle to a running guide. */
export class TheSeamGuideRef {
  constructor(private readonly _session: TheSeamGuideSessionController) {}

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
