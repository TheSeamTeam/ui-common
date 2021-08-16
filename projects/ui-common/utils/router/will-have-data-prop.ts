import { ActivatedRoute } from '@angular/router'

function hasRouteConfigDataProp(route: ActivatedRoute, prop: string): boolean {
  return !!(route && route.routeConfig && route.routeConfig.data && route.routeConfig.data.hasOwnProperty(prop))
}

function hasRouteConfigResolveProp(route: ActivatedRoute, prop: string): boolean {
  return !!(route && route.routeConfig && route.routeConfig.resolve && route.routeConfig.resolve.hasOwnProperty(prop))
}

export function willHaveDataProp(route: ActivatedRoute, prop: string): boolean {
  return hasRouteConfigDataProp(route, prop) || hasRouteConfigResolveProp(route, prop)
}
