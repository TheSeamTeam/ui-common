import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, filter, map, startWith, switchMap, tap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'
import { fader, sideToSide, slider, stepper, transformer } from './hierarchy-route-animations'

export function routeChanges(router: Router)  {
  return router.events.pipe(
    filter<NavigationStart | NavigationEnd>(event => event instanceof NavigationStart || event instanceof NavigationEnd),
    distinctUntilChanged((x, y) => x.id === y.id),
    map(event => ({ url: event.url }))
  )
}


//
// TODO: Animation improvement: Try adding a full component animation that
// queries the <ng-content> and <router-outlet> blocks. When the outlet
// activates, set the animation state to a transition that moves both blocks
// together.
//


let _uid = 0

@Component({
  selector: 'seam-hierarchy-router-outlet',
  templateUrl: './hierarchy-router-outlet.component.html',
  styleUrls: ['./hierarchy-router-outlet.component.scss'],
  animations: [
    // fader,
    slider,
    // transformer,
    // stepper,
    // sideToSide
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HierarchyRouterOutletComponent implements OnInit, OnDestroy {

  private _uid = _uid++

  animState = 'isRight'
  // animState = ''

  outletActive = false

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._router.events.pipe(
      untilDestroyed(this),
      filter(event => event instanceof NavigationEnd),
      // tap(v => console.log(`_hasChildren()[${this._uid}]`, this._hasChildren()))
    )
    .subscribe()

    routeChanges(this._router)
      .pipe(
        untilDestroyed(this),
        tap(() => {
          // if (this._hasChildren()) {
          //   this.animState = 'isLeft'
          // } else {
          //   this.animState = 'isRight'
          // }
        })
      )
      .subscribe(v => console.log(`routeChanges[${this._uid}]`, v))
  }

  ngOnInit() { }

  ngOnDestroy() { }

  private _hasChildren() {
    const count = this._route.pathFromRoot.length - 1
    const countFull = this._router.parseUrl(this._router.url).root.children.primary.segments.length
    // console.log(`_hasChildren[${this._uid}]`, { count, countFull })
    return countFull > count
  }

  prepareRoute(outlet: RouterOutlet) {
    console.log(`outlet[${this._uid}]`, outlet, this.animState, this._hasChildren(), this.outletActive)
    if (outlet.isActivated) {
      // console.log(outlet.isActivated)
      // console.log(outlet.component)
      return this.animState
    } else {
      return undefined
    }
    // console.log(`prepareRoute[${this._uid}]`, this.animState, this._hasChildren())
    // console.log('activatedRouteData', outlet && outlet.activatedRouteData)
    // if (outlet && outlet.isActivated) {
    //   console.log('activatedRoute', outlet.activatedRoute && outlet.activatedRoute.snapshot.url)
    // }
    // return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation']
    // console.log('')
    // return this.animState
  }

  outletActivate(event) {
    console.log(`outletActivate[${this._uid}]`, event)
    this.outletActive = true
  }

  outletDeactivate(event) {
    console.log(`outletDeactivate[${this._uid}]`, event)
    this.outletActive = false
  }

}
