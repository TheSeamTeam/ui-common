import { Injectable } from '@angular/core'
import { NavigationEnd, Router, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'
import { filter, map, startWith } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class RouterHelpersService {

  constructor(
    private _router: Router
  ) { }

  public isActive(url: string | UrlTree, exact: boolean): Observable<boolean> {
    return this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => this._router.isActive(url, exact)),
      startWith(this._router.isActive(url, exact))
    )
  }
}
