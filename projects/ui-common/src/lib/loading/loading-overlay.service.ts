import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError, finalize, tap } from 'rxjs/operators'

import { TheSeamLoadingModule } from './loading.module'
import { LoadingComponent } from './loading/loading.component'

@Injectable({
  providedIn: TheSeamLoadingModule
})
export class TheSeamLoadingOverlayService {

  private _enabled = false

  private _overlayRef: OverlayRef

  constructor(
    private _overlay: Overlay
  ) { }

  get enabled(): boolean {
    return this._enabled
  }

  public toggle(enabled?: boolean) {
    const enable = enabled === undefined ? !this.enabled : enabled
    if (enable && !this.enabled) {
      this.enable()
    } else if (!enable && this.enabled) {
      this.disable()
    }
  }

  public enable() {
    if (this.enabled) { return }

    this._overlayRef = this._overlay.create({
      hasBackdrop: false,
      width: '100%',
      height: '100%'
    })
    this._overlayRef.attach(new ComponentPortal(LoadingComponent))

    this._enabled = true
  }

  public disable() {
    if (!this.enabled) { return }

    this._overlayRef.dispose()

    this._enabled = false
  }

  public while<T = any>(source: Observable<T>): Observable<T> {
    this.enable()
    return source
      .pipe(
        tap(() => this.disable()),
        catchError(err => {
          this.disable()
          return throwError(err)
        }),
        finalize(() => this.disable())
      )
  }

}
