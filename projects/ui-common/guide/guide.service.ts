import {
  inject,
  Injectable,
  isDevMode,
  OnDestroy,
  signal,
  Signal,
} from '@angular/core'

import { THE_SEAM_GUIDE_ADAPTER } from './adapter/guide-adapter'
import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import {
  TheSeamGuideConfig,
  THE_SEAM_GUIDE_DEFAULTS,
} from './models/guide-config'
import { TheSeamGuideBusyError } from './models/guide-errors'
import { TheSeamGuideStep } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'

@Injectable({ providedIn: 'root' })
export class TheSeamGuideService implements OnDestroy {
  private readonly _adapter = inject(THE_SEAM_GUIDE_ADAPTER)
  private readonly _registry = inject(TheSeamGuideTargetRegistry)

  private readonly _activeGuide = signal<TheSeamGuideRef | null>(null)

  /**
   * The running guide, or null. Exposed so a caller can queue itself:
   * `activeGuide()?.afterClosed$.subscribe(() => start(next))`.
   */
  readonly activeGuide: Signal<TheSeamGuideRef | null> =
    this._activeGuide.asReadonly()

  /**
   * Starts a guide. One runs at a time: a dismissible active guide is
   * superseded, a non-dismissible one throws `TheSeamGuideBusyError`.
   *
   * The caller owns the returned ref's lifetime. A guide is **not** closed
   * automatically when the component that started it is destroyed — only
   * when the root injector is (this service is `providedIn: 'root'`), which
   * does not happen on ordinary route/component teardown. A component that
   * starts a guide and may be destroyed before it naturally ends should tie
   * the ref to its own lifetime:
   *
   * ```ts
   * const ref = this._guide.start(config)
   * inject(DestroyRef).onDestroy(() => ref.close())
   * ```
   */
  start(config: TheSeamGuideConfig): TheSeamGuideRef {
    const active = this._activeGuide()
    if (active !== null) {
      if (!active.dismissible) {
        throw new TheSeamGuideBusyError()
      }
      active.close('superseded')
    }

    if (
      isDevMode() &&
      config.dismissible === false &&
      (config.onMissingTarget ?? THE_SEAM_GUIDE_DEFAULTS.onMissingTarget) ===
        'skip'
    ) {
      console.warn(
        'TheSeamGuideService: this guide sets `dismissible: false` with' +
          " `onMissingTarget: 'skip'`, so the user is forced through a guide" +
          ' that may silently drop its own steps. Consider onMissingTarget:' +
          " 'end' or 'elementless'.",
      )
    }

    // eslint-disable-next-line prefer-const -- captured by the closure below before assignment
    let ref: TheSeamGuideRef
    const session = new TheSeamGuideSession(
      config,
      this._adapter,
      this._registry,
      () => this._clearIfCurrent(ref),
    )
    ref = new TheSeamGuideRef(session)
    this._activeGuide.set(ref)
    session.start()
    return ref
  }

  /**
   * Highlights a single element. A one-step guide.
   *
   * As with {@link start}, the caller owns the returned ref's lifetime: it is
   * not closed automatically when the component that requested it is
   * destroyed. See {@link start}'s doc comment for the `DestroyRef` pattern.
   */
  highlight(step: TheSeamGuideStep): TheSeamGuideRef {
    return this.start({ steps: [step] })
  }

  /**
   * Closes any active guide when the owning injector is destroyed —
   * otherwise driver.js's overlay is left in the DOM, and its
   * `pointer-events: none` blocks every click on the page with no recovery
   * short of a reload. `close` always works programmatically even when the
   * guide is `dismissible: false`, which is exactly the case that must not
   * be left behind.
   */
  ngOnDestroy(): void {
    this._activeGuide()?.close('destroyed')
  }

  private _clearIfCurrent(ref: TheSeamGuideRef): void {
    if (this._activeGuide() === ref) {
      this._activeGuide.set(null)
    }
  }
}
