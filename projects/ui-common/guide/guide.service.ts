import { inject, Injectable, isDevMode, signal, Signal } from '@angular/core'

import { THE_SEAM_GUIDE_ADAPTER } from './adapter/guide-adapter'
import { TheSeamGuideRef } from './guide-ref'
import { TheSeamGuideSession } from './guide-session'
import { TheSeamGuideConfig } from './models/guide-config'
import { TheSeamGuideBusyError } from './models/guide-errors'
import { TheSeamGuideStep } from './models/guide-step'
import { TheSeamGuideTargetRegistry } from './target/guide-target-registry'

@Injectable({ providedIn: 'root' })
export class TheSeamGuideService {
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
      (config.onMissingTarget ?? 'skip') === 'skip'
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

  /** Highlights a single element. A one-step guide. */
  highlight(step: TheSeamGuideStep): TheSeamGuideRef {
    return this.start({ steps: [step] })
  }

  private _clearIfCurrent(ref: TheSeamGuideRef): void {
    if (this._activeGuide() === ref) {
      this._activeGuide.set(null)
    }
  }
}
