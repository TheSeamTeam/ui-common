import { Platform } from '@angular/cdk/platform'
import { forwardRef, inject, Injectable, InjectionToken, Injector, INJECTOR, NgZone } from '@angular/core'
import { fromEvent, Subscription } from 'rxjs'

import OverlayScrollbars from 'overlayscrollbars'

import { LIB_OVERLAY_SCROLLBARS_CONFIG, _OverlayScrollbarDefaults } from './overlay-scrollbars-config'
import { IOverlayScrollbarsConfig } from './overlay-scrollbars-config-model'

@Injectable({
  providedIn: 'root'
})
export class OverlayScrollbarsService {

  private _inputEventSubscription = Subscription.EMPTY

  constructor(
    private _ngZone: NgZone,
    private injector: Injector,
    private _platform: Platform
  ) { }

  public initializeInstance(element: HTMLElement, options?: IOverlayScrollbarsConfig): void {
    if (!this.isInstanceEnabled(element) &&
      // The 'overlayscrollbars' library is causing an issue on iOS. Since iOS
      // already has native overlay scrollbars it shouldn't really effect the
      // app layout.
      !(this._isTextarea(element) && this._platform.IOS)
    ) {
      this._ngZone.runOutsideAngular(() => {
        OverlayScrollbars(element, this._applyConfigDefaults(options))

        if (this._isTextarea(element)) {
          // TODO: Make this more accurate. Right now this is just relying on
          // the fact that timing out for 100ms is usually enough time to wait
          // for update to correctly calculate.
          // NOTE: This may be fixed in a newer version to not need this hack.
          fromEvent(element, 'change').subscribe(_ => {
            this._ngZone.run(() => {
              setTimeout(() => {
                if (this.isInstanceEnabled(element)) {
                  this.getInstance(element).update()
                }
              }, 100)
            })
          })
        }
      })
    }
  }

  public destroyInstance(element: HTMLElement): void {
    if (this.isInstanceEnabled(element)) {
      this._ngZone.runOutsideAngular(() => {
        this.getInstance(element).destroy()
        if (this._inputEventSubscription && !this._inputEventSubscription.closed) {
          this._inputEventSubscription.unsubscribe()
        }
      })
    }
  }

  public getInstance(element: HTMLElement): OverlayScrollbars {
    return OverlayScrollbars(element) as OverlayScrollbars
  }

  public isInstanceEnabled(element: HTMLElement): boolean {
    return !!this.getInstance(element)
  }

  public setOptions(element: HTMLElement, options: IOverlayScrollbarsConfig): boolean {
    if (!this.isInstanceEnabled(element)) { return false }

    this.getInstance(element).options(this._applyConfigDefaults(options))

    return true
  }

  public getOptions(element: HTMLElement): IOverlayScrollbarsConfig {
    return this.getInstance(element).options()
  }

  private _applyConfigDefaults(config?: IOverlayScrollbarsConfig): IOverlayScrollbarsConfig {
    const _config: IOverlayScrollbarsConfig = this.injector.get(LIB_OVERLAY_SCROLLBARS_CONFIG, _OverlayScrollbarDefaults)
    return { ..._config, ...config }
  }

  /** Determines if the component host is a textarea. */
  protected _isTextarea(element: HTMLElement) {
    return element.nodeName.toLowerCase() === 'textarea'
  }

}
