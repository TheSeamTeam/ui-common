import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { inject, Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError, finalize, tap } from 'rxjs/operators'

import { TheSeamLoadingComponent } from './loading/loading.component'

@Injectable({ providedIn: 'root' })
export class TheSeamLoadingOverlayService {
  private readonly _overlay = inject(Overlay)

  private _enabled = false

  private _overlayRef?: OverlayRef

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
    if (this.enabled) {
      return
    }

    this._overlayRef = this._overlay.create({
      hasBackdrop: false,
      width: '100%',
      height: '100%',
    })
    this._overlayRef.attach(new ComponentPortal(TheSeamLoadingComponent))

    this._enabled = true
  }

  public disable() {
    if (!this.enabled) {
      return
    }

    this._overlayRef?.dispose()

    this._enabled = false
  }

  public while<T = any>(source: Observable<T>): Observable<T> {
    this.enable()
    return source.pipe(
      tap(() => this.disable()),
      catchError((err) => {
        this.disable()
        return throwError(err)
      }),
      finalize(() => this.disable()),
    )
  }
}
