import { ActivatedRoute } from '@angular/router'

export function leafChildRoute(activatedRoute: ActivatedRoute): ActivatedRoute {
  let route = activatedRoute
  while (route.firstChild) { route = route.firstChild }
  return route
}
