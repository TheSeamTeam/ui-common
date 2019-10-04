import { ActivatedRoute, Data } from '@angular/router'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { leafChildRoute } from '../leafChildRoute'

export interface IActivatedRouteWithData {
  route: ActivatedRoute
  data: Data
}

export function activatedRoutesWithDataProperty(prop: string) {
  const _data = (r: ActivatedRoute) => r.data.pipe(map(_d => ({ route: r, data: _d })))
  return (source$: Observable<ActivatedRoute>): Observable<IActivatedRouteWithData[]> =>
    source$.pipe(
      map(route => leafChildRoute(route)),
      map(route => route.pathFromRoot),
      switchMap(routes => combineLatest(routes.map(r => _data(r)))),
      map(v => v.filter(_v => _v.data.hasOwnProperty(prop)))
    )
}
