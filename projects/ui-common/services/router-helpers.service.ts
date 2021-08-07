import { Injectable } from '@angular/core'
import { IsActiveMatchOptions, NavigationEnd, Router, UrlTree } from '@angular/router'
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
    const opts: IsActiveMatchOptions = exact
      ? { paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' }
      : { paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored' }

    return this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => this._router.isActive(url, opts)),
      startWith(this._router.isActive(url, opts))
    )
  }
}
