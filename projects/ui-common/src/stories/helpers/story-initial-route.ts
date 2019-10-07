import { APP_INITIALIZER, Injectable, InjectionToken, Injector, ModuleWithProviders, NgModule } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter, take } from 'rxjs/operators'

export const STORY_INITIAL_ROUTE_URL = new InjectionToken<any>('STORY_INITIAL_ROUTE_URL')

export function storyInitialRouteFactory(_storyInitialRouteService: StoryInitialRouteService) {
  return () => _storyInitialRouteService.setInitialRoute()
}

@Injectable()
export class StoryInitialRouteService {

  constructor(
    private _injector: Injector
  ) { }

  public setInitialRoute() {
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

@NgModule()
export class StoryInitialRouteModule {
  static forRoot(url: string): ModuleWithProviders {
    return {
      ngModule: StoryInitialRouteModule,
      providers: [
        StoryInitialRouteService,
        {
          provide: APP_INITIALIZER,
          useFactory: storyInitialRouteFactory,
          deps: [ StoryInitialRouteService ],
          multi: true
        },
        { provide: STORY_INITIAL_ROUTE_URL, useValue: url }
      ]
    }
  }

}
