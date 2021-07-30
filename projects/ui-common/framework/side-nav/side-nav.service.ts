import { Injectable } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import { activatedRoutesWithDataProperty, IActivatedRouteWithData, notNullOrUndefined, routeSnapshotPathFull } from '@theseam/ui-common/utils'

import { ISideNavBasic, ISideNavItem, ISideNavLink, SideNavItemState, SideNavItemWithState } from './side-nav.models'

@Injectable({ providedIn: 'root' })
export class TheSeamSideNavService {

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {

  }

  public getItemsState(items: ISideNavItem[]): SideNavItemWithState[] {
    return items.map(itm => this._getItemWithState(itm))
  }

  private _getItemWithState(item: ISideNavItem): SideNavItemWithState {
    const state: SideNavItemState = {
      active: false
    }

    const children = this._getItemChildren(item)

    const withState: SideNavItemWithState = {
      ...item,
      __state: state
    }

    if (this._canHaveChildren(withState) && children !== null) {
      withState.children = children.map(c => this._getItemWithState(c))
    }

    return withState
  }

  private _getItemChildren(item: ISideNavItem): ISideNavItem[] | null {
    if (this._canHaveChildren(item) && notNullOrUndefined(item.children)) {
      return item.children
    }

    return null
  }

  private _canHaveChildren(item: ISideNavItem): item is (ISideNavBasic | ISideNavLink) {
    return item.itemType === 'basic' || item.itemType === 'link'
  }

}
