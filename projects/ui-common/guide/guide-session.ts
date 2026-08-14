import { isDevMode, signal, Signal } from '@angular/core'
import {
  defer,
  EMPTY,
  from,
  isObservable,
  Observable,
  of,
  ReplaySubject,
  Subject,
  Subscription,
} from 'rxjs'
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators'

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
import { TheSeamGuideMissPolicy, TheSeamGuideStep } from './models/guide-step'
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

  private readonly _transitions = new Subject<{
    index: number
    direction: 1 | -1
  }>()
  private _transitionSub: Subscription | null = null
  private _recoverySub: Subscription | null = null

  private _closed = false

  // Whether the currently active step's `afterStep` has already fired for
  // this departure. A skip or a cancellation re-requests a transition
  // without changing `_activeIndex` (the departed-from step never painted
  // anything new), so without this guard the same step's `afterStep` would
  // re-run on every retry. Reset to `false` whenever a step actually paints.
  private _afterStepFired = false

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

    this._transitionSub = this._transitions
      .pipe(
        switchMap((request) =>
          this._runTransition(request.index, request.direction),
        ),
      )
      .subscribe()
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
    this._request(this._activeIndex() + 1, 1)
  }

  previous(): void {
    this._request(this._activeIndex() - 1, -1)
  }

  moveTo(index: number): void {
    this._request(index, index >= this._activeIndex() ? 1 : -1)
  }

  /**
   * Requests a transition.
   *
   * The emission is deferred to a microtask because `_applyMissPolicy` calls
   * this from *inside* the `switchMap` projection. Emitting synchronously there
   * would make the transition cancel itself mid-flight. `fakeAsync`'s `tick()`
   * flushes microtasks, so specs are unaffected.
   */
  private _request(index: number, direction: 1 | -1): void {
    if (this._closed) {
      return
    }
    queueMicrotask(() => {
      if (this._closed) {
        return
      }
      this._transitions.next({ index, direction })
    })
  }

  refresh(): void {
    this._adapter.refresh()
  }

  close(reason: TheSeamGuideCloseReason): void {
    if (this._closed) {
      return
    }
    this._closed = true
    this._transitionSub?.unsubscribe()
    this._transitionSub = null
    this._disarmRecovery()
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

  /**
   * The one sequence every transition runs. Cancellable: a new request causes
   * `switchMap` to unsubscribe from this, so nothing paints after teardown.
   *
   * A `catchError` wraps the whole sequence: a hook that throws or rejects
   * must not escape to the outer `_transitions` subscriber, because that
   * subscriber has no error handler of its own and an uncaught error there
   * would unsubscribe it permanently, silently wedging the session (`next`,
   * `previous`, and `moveTo` would become no-ops forever). A caught failure
   * closes the guide rather than running the miss policy: the miss policy
   * exists for a target that never appeared, not an arbitrary thrown error,
   * and reusing it would (a) misreport the close reason as `'targetMissing'`
   * for an `'end'`-policy step that never had a target problem, and (b) run
   * `_applyMissPolicy` unprotected as the last step of an error handler,
   * where a further throw (e.g. from `_paint` → `_onStepPainted`, which
   * Task 7 turns into real logic) would escape to the same unhandled outer
   * subscriber this whole `catchError` exists to protect.
   */
  private _runTransition(
    index: number,
    direction: 1 | -1,
  ): Observable<unknown> {
    if (this._closed) {
      return EMPTY
    }
    this._disarmRecovery()
    if (index >= this.steps.length) {
      this.close('completed')
      return EMPTY
    }
    if (index < 0) {
      return EMPTY
    }

    const outgoing =
      this._activeIndex() >= 0 ? this.steps[this._activeIndex()] : undefined
    const incoming = this.steps[index]

    const afterStep$ = this._afterStepFired
      ? of(null)
      : defer(() => {
          this._afterStepFired = true
          return this._runHook(outgoing?.afterStep)
        })

    return afterStep$.pipe(
      switchMap(() => this._runHook(incoming.beforeStep)),
      switchMap(() => this._resolveTarget(incoming)),
      switchMap((outcome) => {
        if (this._closed) {
          return EMPTY
        }
        if (outcome === 'missing') {
          return this._applyMissPolicy(index, incoming, direction)
        }
        this._paint(index, incoming)
        return EMPTY
      }),
      catchError((err) => {
        // Deliberately no call-out to `_applyMissPolicy` or anything else
        // that could itself throw: this handler is the last backstop before
        // the outer, handler-less `_transitions` subscription, so the whole
        // body is wrapped in `try/catch` and swallows on failure — there is
        // nothing left to recover to.
        try {
          if (this._closed) {
            return EMPTY
          }
          if (isDevMode()) {
            console.warn(
              `TheSeamGuideSession: step ${index} threw during its` +
                ` transition (${String(err)}); closing the guide.`,
            )
          }
          this.close('destroyed')
        } catch {
          // Nothing left to recover from.
        }
        return EMPTY
      }),
    )
  }

  /** Paints a step that is actually entering: real target or elementless. */
  private _paint(index: number, step: TheSeamGuideStep): void {
    this._activeIndex.set(index)
    this._afterStepFired = false
    this._adapter.moveTo(index)
    this._emit({ type: 'stepChanged', index, step })
    this._onStepPainted(index, step)
  }

  /**
   * Arms mid-step loss detection for a painted step.
   *
   * Only named targets are watched — a selector or `Element` has no
   * notification channel, so recovery does not apply to them in v1.
   */
  protected _onStepPainted(index: number, step: TheSeamGuideStep): void {
    this._disarmRecovery()

    const name = typeof step.element === 'string' ? step.element : null
    if (name === null) {
      return
    }
    if (this._registry.resolve(name) === null) {
      return
    }

    this._recoverySub = this._registry.changes$
      .pipe(
        filter((changed) => changed === name),
        filter(() => this._registry.resolve(name) === null),
        take(1),
        switchMap(() => {
          this._emit({ type: 'targetLost', index, step })
          const grace = this.options.targetLostGrace
          return this._registry.waitFor(name, grace).pipe(
            map(() => 'recovered' as const),
            catchError(() => of('lost' as const)),
          )
        }),
        tap((outcome) => {
          if (this._closed) {
            return
          }
          if (outcome === 'recovered') {
            this._adapter.refresh()
            this._emit({ type: 'targetRecovered', index, step })
            // Re-arm on a microtask: `_onStepPainted` calls `_disarmRecovery`,
            // which would otherwise unsubscribe this subscription from inside
            // its own `tap`.
            queueMicrotask(() => {
              if (!this._closed) {
                this._onStepPainted(index, step)
              }
            })
            return
          }
          this._applyTargetLostPolicy(index, step)
        }),
      )
      .subscribe()
  }

  private _applyTargetLostPolicy(index: number, step: TheSeamGuideStep): void {
    const policy: TheSeamGuideMissPolicy =
      step.onTargetLost ?? this.options.onTargetLost

    if (policy === 'end') {
      this.close('targetMissing')
      return
    }
    if (policy === 'skip') {
      this._request(index + 1, 1)
      return
    }
    // 'elementless' — the resolver now returns undefined, so a refresh collapses
    // the popover to centered without a step transition.
    this._adapter.refresh()
  }

  private _disarmRecovery(): void {
    this._recoverySub?.unsubscribe()
    this._recoverySub = null
  }

  private _runHook(
    hook: (() => void | Promise<void> | Observable<unknown>) | undefined,
  ): Observable<unknown> {
    if (hook === undefined) {
      return of(null)
    }
    return defer(() => {
      const result = hook()
      if (result === undefined || result === null) {
        return of(null)
      }
      if (isObservable(result)) {
        return result.pipe(take(1))
      }
      return from(result)
    })
  }

  /** Resolves `'resolved'` or `'missing'`. Never throws. */
  private _resolveTarget(
    step: TheSeamGuideStep,
  ): Observable<'resolved' | 'missing'> {
    const target = step.element
    if (target === undefined) {
      return of('resolved')
    }
    if (typeof target !== 'string') {
      const el = target instanceof Element ? target : target.nativeElement
      return of(el?.isConnected ? 'resolved' : 'missing')
    }

    const direct = this._registry.resolve(target)
    if (direct !== null) {
      return of('resolved')
    }
    const selectorMatch = safeQuerySelector(target)
    if (selectorMatch !== null) {
      return of('resolved')
    }

    const timeoutMs = step.targetTimeout ?? this.options.targetTimeout
    return this._registry.waitFor(target, timeoutMs).pipe(
      map(() => 'resolved' as const),
      catchError(() => of('missing' as const)),
    )
  }

  private _applyMissPolicy(
    index: number,
    step: TheSeamGuideStep,
    direction: 1 | -1,
  ): Observable<never> {
    const policy: TheSeamGuideMissPolicy =
      step.onMissingTarget ?? this.options.onMissingTarget

    if (policy === 'end') {
      this.close('targetMissing')
      return EMPTY
    }

    if (policy === 'elementless') {
      this._paint(index, step)
      return EMPTY
    }

    if (isDevMode()) {
      console.warn(
        `TheSeamGuideSession: skipping step ${index} because its target` +
          ` "${String(step.element)}" never appeared.`,
      )
    }
    this._emit({ type: 'stepSkipped', index, step })

    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= this.steps.length) {
      this.close(direction === 1 ? 'completed' : 'dismissed')
      return EMPTY
    }
    this._request(nextIndex, direction)
    return EMPTY
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

  /**
   * Synchronous best-effort resolution, used by the adapter's live element
   * resolver at paint time. `_resolveTarget` is the awaiting version used to
   * gate transitions.
   */
  protected _resolveNow(step: TheSeamGuideStep): Element | null {
    const target = step.element
    if (target === undefined) {
      return null
    }
    if (typeof target === 'string') {
      return this._registry.resolve(target) ?? safeQuerySelector(target)
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

/** `querySelector` throws on an invalid selector; a registry name often is one. */
function safeQuerySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector)
  } catch {
    return null
  }
}
