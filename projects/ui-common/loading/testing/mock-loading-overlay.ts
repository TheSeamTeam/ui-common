import { Observable, throwError } from 'rxjs'
import { catchError, finalize, tap } from 'rxjs/operators'

import { TheSeamLoadingOverlayService } from '../loading-overlay.service'
import { Provider } from '@angular/core'

export class MockTheSeamLoadingOverlayService {
  private _enabled = false

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

    this._enabled = true
  }

  public disable() {
    if (!this.enabled) {
      return
    }

    this._enabled = false
  }

  public while(source: Observable<any>) {
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

export function provideMockLoadingService(): Provider {
  return {
    provide: TheSeamLoadingOverlayService,
    useClass: MockTheSeamLoadingOverlayService,
  }
}
