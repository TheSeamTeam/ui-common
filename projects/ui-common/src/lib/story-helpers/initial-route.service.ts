import { Injectable, InjectionToken, Injector } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter, take } from 'rxjs/operators'

export const STORY_INITIAL_ROUTE_URL = new InjectionToken<any>('STORY_INITIAL_ROUTE_URL')

@Injectable()
export class StoryInitialRouteService {

  constructor(
    private _injector: Injector
  ) { }

  public setInitialRoute() {
    console.log('setInitialRoute')
    const _router = this._injector.get(Router)
    const url = this._injector.get(STORY_INITIAL_ROUTE_URL)
    if (_router.navigated) {
      _router.navigateByUrl(url)
    } else {
      _router.events.pipe(
          filter(e => e instanceof NavigationEnd),
          take(1)
        )
        .subscribe(() => { _router.navigateByUrl(url) })
    }
  }

}
