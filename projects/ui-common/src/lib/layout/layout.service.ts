import { Injectable } from '@angular/core'
import { MediaObserver } from '@angular/flex-layout'
import { Observable } from 'rxjs'

import { MediaQueryAliases } from './breakpoint-aliases'
import { observeMediaQuery } from './observe-media-query'

@Injectable({
  providedIn: 'root'
})
export class TheSeamLayoutService {

  /**
   * Is app a mobile-like size.
   */
  public isMobile$: Observable<boolean>

  constructor(
    private _media: MediaObserver
  ) {
    this.isMobile$ = this.observe('lt-sm')
  }

  public observe(alias: MediaQueryAliases): Observable<boolean> {
    return observeMediaQuery(this._media, alias)
  }

}
