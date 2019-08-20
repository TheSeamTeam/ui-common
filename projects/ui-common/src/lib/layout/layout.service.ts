import { Injectable } from '@angular/core'
import { MediaObserver } from '@angular/flex-layout'
import { Observable } from 'rxjs'

import { MediaQueryAliases } from './breakpoint-aliases'
import { observeMediaQuery } from './observe-media-query'

@Injectable({
  providedIn: 'root'
})
export class TheSeamLayoutService {

  constructor(
    private _media: MediaObserver
  ) { }

  public observe(alias: MediaQueryAliases): Observable<boolean> {
    return observeMediaQuery(this._media, alias)
  }

}
