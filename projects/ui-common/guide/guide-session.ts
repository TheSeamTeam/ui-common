import { signal, Signal } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'

import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterStep,
} from './adapter/guide-adapter'
import { TheSeamGuideSessionController } from './guide-ref'
import {
  TheSeamGuideConfig,
  TheSeamGuideResolvedConfig,
  THE_SEAM_GUIDE_DEFAULTS,
} from './models/guide-config'
import {
  TheSeamGuideCloseReason,
  TheSeamGuideEvent,
  TheSeamGuideResult,
} from './models/guide-event'
import { TheSeamGuideStep } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'

export class TheSeamGuideSession implements TheSeamGuideSessionController {
  // ReplaySubject, not Subject: `start()` runs synchronously (including its
  // `'started'` emit) before the service hands the ref back to the caller, so
  // a subscriber that attaches right after `start()` returns is necessarily
  // late. Replaying history is what lets it still observe events already
  // emitted during that synchronous start, matching `_afterClosed` below.
  private readonly _events = new ReplaySubject<TheSeamGuideEvent>()
  private readonly _afterClosed = new ReplaySubject<TheSeamGuideResult>(1)
  private readonly _activeIndex = signal(-1)

  private _closed = false

  readonly steps: TheSeamGuideStep[]
  readonly options: TheSeamGuideResolvedConfig

  readonly events$: Observable<TheSeamGuideEvent> = this._events.asObservable()
  readonly afterClosed$: Observable<TheSeamGuideResult> =
    this._afterClosed.asObservable()
  readonly activeIndex: Signal<number> = this._activeIndex.asReadonly()

  constructor(
    config: TheSeamGuideConfig,
    private readonly _adapter: TheSeamGuideAdapter,
    private readonly _registry: TheSeamGuideTargetRegistry,
    private readonly _onClosed: (session: TheSeamGuideSession) => void,
  ) {
    this.steps = config.steps
    this.options = { ...THE_SEAM_GUIDE_DEFAULTS, ...stripUndefined(config) }
  }

  get dismissible(): boolean {
    return this.options.dismissible
  }

  start(): void {
    this._adapter.start(
      {
        steps: this.steps.map((step) => this._toAdapterStep(step)),
        allowUserDismiss: this.options.dismissible,
      },
      {
        onNextRequested: () => this.next(),
        onPreviousRequested: () => this.previous(),
        onCloseRequested: () => this.close('dismissed'),
      },
    )
    this._emit({ type: 'started' })
    this.moveTo(0)
  }

  next(): void {
    this.moveTo(this._activeIndex() + 1)
  }

  previous(): void {
    this.moveTo(this._activeIndex() - 1)
  }

  /** Replaced in Task 6 by the full transition sequence. */
  moveTo(index: number): void {
    if (this._closed) {
      return
    }
    if (index >= this.steps.length) {
      this.close('completed')
      return
    }
    if (index < 0) {
      return
    }
    this._activeIndex.set(index)
    this._adapter.moveTo(index)
    this._emit({ type: 'stepChanged', index, step: this.steps[index] })
  }

  refresh(): void {
    this._adapter.refresh()
  }

  close(reason: TheSeamGuideCloseReason): void {
    if (this._closed) {
      return
    }
    this._closed = true
    const result: TheSeamGuideResult = {
      reason,
      lastIndex: this._activeIndex(),
    }
    this._adapter.destroy()
    this._emit({ type: 'closed', result })
    this._afterClosed.next(result)
    this._afterClosed.complete()
    this._events.complete()
    this._onClosed(this)
  }

  protected _emit(event: TheSeamGuideEvent): void {
    this._events.next(event)
  }

  /** Element is a resolver function so the engine re-resolves at paint time. */
  protected _toAdapterStep(step: TheSeamGuideStep): TheSeamGuideAdapterStep {
    return {
      element:
        step.element === undefined
          ? undefined
          : () => this._resolveNow(step) ?? undefined,
      popover: step.popover === undefined ? undefined : { ...step.popover },
    }
  }

  /** Synchronous best-effort resolution. Task 6 adds the awaiting version. */
  protected _resolveNow(step: TheSeamGuideStep): Element | null {
    const target = step.element
    if (target === undefined) {
      return null
    }
    if (typeof target === 'string') {
      return this._registry.resolve(target) ?? document.querySelector(target)
    }
    if (target instanceof Element) {
      return target
    }
    return target.nativeElement
  }
}

function stripUndefined(
  config: TheSeamGuideConfig,
): Partial<TheSeamGuideResolvedConfig> {
  const { steps: _steps, ...rest } = config
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      out[key] = value
    }
  }
  return out as Partial<TheSeamGuideResolvedConfig>
}
