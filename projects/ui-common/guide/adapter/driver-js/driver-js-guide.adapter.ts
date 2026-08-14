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
    this._driver?.refresh()
  }

  destroy(): void {
    if (this._driver === null) {
      return
    }
    const instance = this._driver
    // Null first: destroy() triggers onDestroyStarted, and the session has
    // already decided to close.
    this._driver = null
    instance.destroy()
  }

  isActive(): boolean {
    return this._driver?.isActive() ?? false
  }

  private _toDriveStep(step: TheSeamGuideAdapterStep): DriveStep {
    const description = step.popover?.description
    return {
      element:
        step.element === undefined
          ? undefined
          : () => step.element?.() as Element,
      popover:
        step.popover === undefined
          ? undefined
          : {
              title: step.popover.title,
              description:
                typeof description === 'string' ? description : undefined,
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
