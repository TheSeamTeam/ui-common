import { Injectable } from '@angular/core'
import { ActivatedRoute, IsActiveMatchOptions, NavigationEnd, Router, UrlCreationOptions } from '@angular/router'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import { RouterHelpersService } from '@theseam/ui-common/services'
import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'

import { isNavItemType } from './side-nav-utils'
import { ISideNavBasic, ISideNavItem, ISideNavItemState, ISideNavLink } from './side-nav.models'

@Injectable({ providedIn: 'root' })
export class TheSeamSideNavService {

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _routerHelper: RouterHelpersService
  ) { }

  private _canHaveChildren(item: ISideNavItem): item is (ISideNavBasic | ISideNavLink) {
    return isNavItemType(item, 'basic') || isNavItemType(item, 'link')
  }

  public updateItemsStates(items: ISideNavItem[]): void {
    for (const item of items) {
      this.updateItemState(item)

      if (this._canHaveChildren(item) && hasProperty(item, 'children') && item.children !== null) {
        this.updateItemsStates(item.children)
      }
    }
  }

  public updateItemState(item: ISideNavItem): void {
    this._setDefaultState(item)

    if (isNavItemType(item, 'link')) {
      const url = this._getUrl(item)
      if (notNullOrUndefined(url)) {
        const opts = this._getMatchOptions(item)
        this._setItemStateProp(item, 'active', this._router.isActive(url, opts))
      }
    }
  }

  private _setDefaultState(item: ISideNavItem): void {
    if (!hasProperty(item, '__state')) {
      item.__state = {
        active: false
      }
    }
  }

  private _setItemStateProp<K extends keyof ISideNavItemState>(item: ISideNavItem, prop: K, value: ISideNavItemState[K]): void {
    if (hasProperty(item, '__state')) {
      item.__state[prop] = value
    }
  }

  private _getNavExtras(item: ISideNavLink): UrlCreationOptions {
    const navigationExtras: UrlCreationOptions = { }
    if (hasProperty(item, 'queryParams')) {
      navigationExtras.queryParams = item.queryParams
    }
    if (hasProperty(item, 'fragment')) {
      navigationExtras.fragment = item.fragment
    }
    if (hasProperty(item, 'queryParamsHandling')) {
      navigationExtras.queryParamsHandling = item.queryParamsHandling
    }
    if (hasProperty(item, 'preserveFragment')) {
      navigationExtras.preserveFragment = item.preserveFragment
    }
    return navigationExtras
  }

  private _getUrl(item: ISideNavLink): string | null {
    const link = item.link

    if (typeof link === 'string') {
      // return this._router.createUrlTree([ link ], this._getNavExtras(item)).toString()
      const tree = this._router.createUrlTree([ link ], this._getNavExtras(item))
      return tree.toString()
    } else if (Array.isArray(link)) {
      return this._router.createUrlTree(link, this._getNavExtras(item)).toString()
    }

    return null
  }

  private _getMatchOptions(item: ISideNavLink): IsActiveMatchOptions {
    const defaultMatchOpts: IsActiveMatchOptions = {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    }

    if (hasProperty(item, 'matchOptions')) {
      return {
        ...defaultMatchOpts,
        ...item.matchOptions
      }
    }

    return defaultMatchOpts
  }
}
