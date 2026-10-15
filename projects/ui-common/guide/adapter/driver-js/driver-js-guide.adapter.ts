import { Injectable } from '@angular/core'
import { Config, DriveStep, driver, Driver, PopoverDOM } from 'driver.js'

import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterCallbacks,
  TheSeamGuideAdapterConfig,
  TheSeamGuideAdapterPopover,
  TheSeamGuideAdapterStep,
} from '../guide-adapter'
import { ExhaustiveMap } from '../../models/exhaustive-map'

/**
 * driver.js implementation of the guide adapter.
 *
 * The whole step array is handed to driver.js so its buttons, progress
 * indicator, and focus handling are preserved, but every navigation click is
 * intercepted and reported instead of acted on. The session decides what
 * happens next.
 *
 * driver.js's own keyboard navigation is off. It listens on `window` and acts
 * on every Escape and arrow key, including ones typed into a field; the
 * session handles keys instead.
 */
@Injectable()
export class DriverJsGuideAdapter implements TheSeamGuideAdapter {
  private _driver: Driver | null = null

  start(
    config: TheSeamGuideAdapterConfig,
    callbacks: TheSeamGuideAdapterCallbacks,
  ): void {
    this.destroy()

    const driverConfig: Config = {
      steps: config.steps.map((step) => this._toDriveStep(step)),
      allowClose: config.allowUserDismiss,
      allowKeyboardControl: false,
      showButtons: config.allowUserDismiss
        ? ['next', 'previous', 'close']
        : ['next', 'previous'],
      // Intercept every navigation: driver.js must never advance itself,
      // because the session owns sequencing.
      onNextClick: () => callbacks.onNextRequested(),
      onPrevClick: () => callbacks.onPreviousRequested(),
      onCloseClick: () => callbacks.onCloseRequested(),
      onDestroyStarted: () => callbacks.onCloseRequested(),
    }

    this._driver = driver(driverConfig)
  }

  moveTo(index: number): void {
    if (this._driver === null) {
      return
    }
    if (!this._driver.isActive()) {
      this._driver.drive(index)
      return
    }
    this._driver.moveTo(index)
  }

  refresh(): void {
    // driver.js's own refresh() only repositions the overlay/popover around
    // the cached active element — it never re-invokes the step's element
    // resolver. Re-driving the current index is what forces re-resolution,
    // which is the whole point of `refresh()` for mid-step recovery.
    //
    // This re-drive rebuilds the popover DOM every time, producing a visible
    // flash even when the resolved element hasn't changed — driver.js has no
    // primitive for "re-resolve without re-render". Callers should treat this
    // as a recovery operation, not something to invoke speculatively.
    const index = this._driver?.getActiveIndex()
    if (index !== undefined) {
      this._driver?.moveTo(index)
    }
  }

  reposition(): void {
    // driver.js's own refresh() is exactly this: it re-measures the element
    // it already highlights and moves the overlay and popover to fit.
    this._driver?.refresh()
  }

  destroy(): void {
    if (this._driver === null) {
      return
    }
    const instance = this._driver
    // Null first, out of caution: if driver.js's public destroy() ever starts
    // invoking onDestroyStarted synchronously, we don't want that callback
    // re-entering this adapter through a non-null _driver. Today it doesn't —
    // destroy() tears down with confirm=false and always skips
    // onDestroyStarted — so this ordering isn't load-bearing for the current
    // wiring, just defensive against a future driver.js change.
    this._driver = null
    instance.destroy()
  }

  isActive(): boolean {
    return this._driver?.isActive() ?? false
  }

  private _toDriveStep(step: TheSeamGuideAdapterStep): DriveStep {
    // Typed honestly as `Element | undefined`, matching what the resolver
    // can actually return — `undefined` is a real outcome, not an absent
    // one, since the elementless path depends on it.
    const resolveElement: (() => Element | undefined) | undefined =
      step.element === undefined ? undefined : () => step.element?.()
    return {
      // driver.js's own public type only declares `() => Element`, but its
      // runtime falls back to a centered popover when the resolver returns
      // `undefined`. This cast crosses that documentation gap at the one
      // point it matters; `resolveElement` above keeps `undefined` visible
      // everywhere else in this method.
      element: resolveElement as (() => Element) | undefined,
      popover:
        step.popover === undefined
          ? undefined
          : this._toDrivePopover(step.popover),
    }
  }

  /**
   * `ExhaustiveMap` makes every key of `TheSeamGuideAdapterPopover` required
   * in `mapped`, so adding a field to the boundary is a compile error here
   * until it is carried through.
   */
  private _toDrivePopover(
    popover: TheSeamGuideAdapterPopover,
  ): NonNullable<DriveStep['popover']> {
    const mapped: ExhaustiveMap<TheSeamGuideAdapterPopover> = {
      title: popover.title,
      description: popover.description,
      side: popover.side,
      align: popover.align,
      showButtons: popover.showButtons,
      nextButtonText: popover.nextButtonText,
      previousButtonText: popover.previousButtonText,
      doneButtonText: popover.doneButtonText,
      showProgress: popover.showProgress,
      progressText: popover.progressText,
    }
    const { title, description, showButtons, nextButtonText } = mapped
    const hasNode =
      title instanceof HTMLElement || description instanceof HTMLElement
    // driver.js reads an empty list as "no preference" and shows every button.
    const noButtons = showButtons !== undefined && showButtons.length === 0

    const onPopoverRender =
      hasNode || noButtons || nextButtonText !== undefined
        ? (dom: PopoverDOM) => {
            // driver.js hides a slot whose string is falsy, so a slot filled
            // with a node must be un-hidden as well as populated. It also
            // rebuilds the whole popover on every render, so this runs again
            // on each re-drive and simply re-adopts the same host node.
            if (title instanceof HTMLElement) {
              dom.title.replaceChildren(title)
              dom.title.style.display = 'block'
            }
            if (description instanceof HTMLElement) {
              dom.description.replaceChildren(description)
              dom.description.style.display = 'block'
            }
            // Set here, not as `nextBtnText`: driver.js lets a step's
            // `nextBtnText` replace "Done" on the last step, so a label set
            // for every step would hide it.
            if (
              nextButtonText !== undefined &&
              !dom.nextButton.classList.contains('driver-popover-done-btn')
            ) {
              dom.nextButton.innerHTML = nextButtonText
            }
            if (noButtons) {
              hideButtons(dom)
            }
          }
        : undefined

    // driver.js spreads a step's popover over the values it worked out for
    // it, so a key present as `undefined` would erase one. Only set keys go.
    return withoutUndefined({
      title: typeof title === 'string' ? title : undefined,
      description: typeof description === 'string' ? description : undefined,
      side: mapped.side,
      align: mapped.align,
      // driver.js itself leaves out `'close'` while `allowClose` is false.
      showButtons: noButtons ? undefined : showButtons,
      prevBtnText: mapped.previousButtonText,
      doneBtnText: mapped.doneButtonText,
      showProgress: mapped.showProgress,
      progressText: mapped.progressText,
      onPopoverRender,
    })
  }
}

function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T
}

/** The footer stays only when it still has the progress text in it. */
function hideButtons(dom: PopoverDOM): void {
  dom.closeButton.style.display = 'none'
  dom.footerButtons.style.display = 'none'
  if (dom.progress.style.display !== 'block') {
    dom.footer.style.display = 'none'
  }
}
