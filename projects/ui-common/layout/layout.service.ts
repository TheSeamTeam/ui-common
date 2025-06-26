import { Injectable } from '@angular/core'
import { MediaObserver } from '@angular/flex-layout'
import { BehaviorSubject, Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'

import { MediaQueryAliases } from './breakpoint-aliases'
import { observeMediaQuery } from './observe-media-query'

@Injectable({
  providedIn: 'root'
})
export class TheSeamLayoutService {

  /**
   * Observes if app is a mobile-like size.
   * Default mobile breakpoint is <= 599px,
   * use setMobileBreakpoint() to change size.
   */
  public isMobile$: Observable<boolean>

  private _mobileBreakpoint = new BehaviorSubject<MediaQueryAliases>('lt-sm')
  public mobileBreakpoint$ = this._mobileBreakpoint.asObservable()

  constructor(
    private _media: MediaObserver
  ) {
    this.isMobile$ = this.mobileBreakpoint$.pipe(
      switchMap(breakpoint => this.observe(breakpoint)),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  public observe(alias: MediaQueryAliases): Observable<boolean> {
    return observeMediaQuery(this._media, alias)
  }

  /**
   * Update breakpoint observed by isMobile$
   */
  public setMobileBreakpoint(alias: MediaQueryAliases) {
    this._mobileBreakpoint.next(alias)
  }

}
