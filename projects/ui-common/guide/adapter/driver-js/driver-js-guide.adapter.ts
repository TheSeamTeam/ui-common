import { Injectable } from '@angular/core'
import { Config, DriveStep, driver, Driver } from 'driver.js'

import {
  TheSeamGuideAdapter,
  TheSeamGuideAdapterCallbacks,
  TheSeamGuideAdapterConfig,
  TheSeamGuideAdapterStep,
} from '../guide-adapter'

/**
 * driver.js implementation of the guide adapter.
 *
 * The whole step array is handed to driver.js so its buttons, progress
 * indicator, and keyboard handling are preserved, but every navigation click is
 * intercepted and reported instead of acted on. The session decides what
 * happens next.
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

  next(): void {
    this._driver?.moveNext()
  }

  previous(): void {
    this._driver?.movePrevious()
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
    const description = step.popover?.description
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
          : {
              title: step.popover.title,
              description:
                typeof description === 'string' ? description : undefined,
              side: step.popover.side,
              align: step.popover.align,
              // A DOM node is appended after render, which is how template and
              // component content will work when it is added.
              onPopoverRender:
                description instanceof HTMLElement
                  ? (popover: { description: HTMLElement }) => {
                      popover.description.replaceChildren(description)
                    }
                  : undefined,
            },
    }
  }
}
