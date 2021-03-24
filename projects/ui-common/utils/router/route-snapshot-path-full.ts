import { ActivatedRouteSnapshot } from '@angular/router'

import { routeSnapshotPathRelative } from './route-snapshot-path-relative'

export function routeSnapshotPathFull(route: ActivatedRouteSnapshot) {
  return route.pathFromRoot.reduce((path, _route) => path += routeSnapshotPathRelative(_route), '')
}
