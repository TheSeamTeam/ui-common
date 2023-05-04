import { ActivatedRouteSnapshot } from '@angular/router'

export function routeSnapshotPathRelative(route: ActivatedRouteSnapshot) {
  return route.url.reduce((path, urlSegment) => `${path}/${urlSegment.path}`, '')
}
