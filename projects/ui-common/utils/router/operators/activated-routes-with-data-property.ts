import { ActivatedRoute, Data } from '@angular/router'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { leafChildRoute } from '../leaf-child-route'

export interface IActivatedRouteWithData {
  route: ActivatedRoute
  data: Data
}

function hasRouteConfigDataProp(route: ActivatedRoute, prop: string) {
  return !!(route && route.routeConfig && route.routeConfig.data && route.routeConfig.data.hasOwnProperty(prop))
}

function hasRouteConfigResolveProp(route: ActivatedRoute, prop: string) {
  return !!(route && route.routeConfig && route.routeConfig.resolve && route.routeConfig.resolve.hasOwnProperty(prop))
}

export function activatedRoutesWithDataProperty(prop: string, mustHaveDefined: boolean = false) {
  const _data = (r: ActivatedRoute) => r.data.pipe(map(_d => ({ route: r, data: _d })))
  return (source$: Observable<ActivatedRoute>): Observable<IActivatedRouteWithData[]> =>
    source$.pipe(
      map(route => leafChildRoute(route)),
      map(route => route.pathFromRoot),
      switchMap(routes => combineLatest(routes.map(r => _data(r)))),
      map(v => v.filter(_v => _v.data.hasOwnProperty(prop))),
      map(v => mustHaveDefined
        ? v.filter(_v => hasRouteConfigDataProp(_v.route, prop) || hasRouteConfigResolveProp(_v.route, prop))
        : v
      )
    )
}
