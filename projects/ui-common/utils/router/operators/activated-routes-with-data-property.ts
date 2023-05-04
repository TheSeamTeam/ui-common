import { ActivatedRoute, Data } from '@angular/router'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { leafChildRoute } from '../leaf-child-route'
import { willHaveDataProp } from '../will-have-data-prop'

export interface IActivatedRouteWithData {
  route: ActivatedRoute
  data: Data
}

export function activatedRoutesWithDataProperty(prop: string, mustHaveDefined: boolean = false) {
  const _data = (r: ActivatedRoute) => r.data.pipe(map(_d => ({ route: r, data: _d })))
  return (source$: Observable<ActivatedRoute>): Observable<IActivatedRouteWithData[]> =>
    source$.pipe(
      map(route => leafChildRoute(route)),
      map(route => route.pathFromRoot),
      switchMap(routes => combineLatest(routes.map(r => _data(r)))),
      map(v => v.filter(_v => Object.prototype.hasOwnProperty.call(_v.data, prop))),
      map(v => mustHaveDefined
        ? v.filter(_v => willHaveDataProp(_v.route, prop))
        : v
      )
    )
}
