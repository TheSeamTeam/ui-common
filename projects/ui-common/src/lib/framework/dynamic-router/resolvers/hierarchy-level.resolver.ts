import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class HierarchyLevelResolver implements Resolve<number> {

  constructor() {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<number> | Promise<number> | number {
    // console.log('[HierarchyLevelResolver]', route)
    // console.log('[HierarchyLevelResolver]', state)
    return this._getMaxHierLevel(route)
  }

  private _getMaxHierLevel(route: ActivatedRouteSnapshot) {
    let curr = route
    while (curr.parent) {
      curr = curr.parent
      if (curr.data['hierLevel']) {
        return curr.data['hierLevel'] + 1
      }
    }

    return 0
  }

}
