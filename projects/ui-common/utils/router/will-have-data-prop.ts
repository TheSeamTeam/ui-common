import { ActivatedRoute } from '@angular/router'

function hasRouteConfigDataProp(route: ActivatedRoute, prop: string): boolean {
  return !!(route && route.routeConfig && route.routeConfig.data && Object.prototype.hasOwnProperty.call(route.routeConfig.data, prop))
}

function hasRouteConfigResolveProp(route: ActivatedRoute, prop: string): boolean {
  return !!(route && route.routeConfig && route.routeConfig.resolve && Object.prototype.hasOwnProperty.call(route.routeConfig.resolve, prop))
}

export function willHaveDataProp(route: ActivatedRoute, prop: string): boolean {
  return hasRouteConfigDataProp(route, prop) || hasRouteConfigResolveProp(route, prop)
}
