import { Injectable } from '@angular/core'
import { IsActiveMatchOptions, NavigationEnd, Router, UrlCreationOptions } from '@angular/router'
import { BehaviorSubject, defer, Observable, Subject, Subscriber } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'

import {
  horizontalNavItemCanExpand,
  getHorizontalNavItemStateProp,
  horizontalNavItemHasActiveChild,
  horizontalNavItemHasChildren,
  horizontalNavItemHasExpandedChild,
  isHorizontalNavItemType,
  setDefaultHorizontalNavItemState,
  setHorizontalNavItemStateProp
} from './nav-utils'
import { INavItem, INavItemState, INavLink, NavItemStateChanged } from './nav.models'

@Injectable()
export class TheSeamNavService {

  private readonly _updatingCount = new BehaviorSubject<number>(0)

  public readonly loading$: Observable<boolean>

  public readonly itemChanged = new Subject<NavItemStateChanged>()

  constructor(
    private readonly _router: Router
  ) {
    this.loading$ = this._updatingCount.pipe(
      map(count => count > 0),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  public createItemsObservable(items: INavItem[]): Observable<INavItem[]> {
    return defer(() => {
      this.updateItemsStates(items)
      return new Observable((subscriber: Subscriber<INavItem[]>) => {
        const stateChangeSub = this.itemChanged.pipe(
          switchMap(change => {
            return this.loading$.pipe(filter(loading => !loading))
          })
        ).subscribe(() => {
          subscriber.next(items)
        })

        try {
          this.updateItemsStates(items)
        } catch (err) {
          subscriber.error(err)
        }

        const routeChangeSub = this._router.events.pipe(
          filter(event => event instanceof NavigationEnd),
        ).subscribe(() => {
          try {
            this.updateItemsStates(items)
          } catch (err) {
            subscriber.error(err)
          }
        })

        return () => {
          stateChangeSub.unsubscribe()
          routeChangeSub.unsubscribe()
        }
      }).pipe(startWith(items))
    })
  }

  private _incUpdatingCount(): void {
    this._updatingCount.next(this._updatingCount.value + 1)
  }

  private _decrUpdatingCount(): void {
    this._updatingCount.next(this._updatingCount.value - 1)
  }

  public updateItemsStates(items: INavItem[]): void {
    this._incUpdatingCount()

    try {
      for (const item of items) {
        if (horizontalNavItemHasChildren(item)) {
          this.updateItemsStates(item.children)
        }

        this.updateItemState(item)
      }

      this._decrUpdatingCount()
    } catch (err) {
      this._decrUpdatingCount()
      throw err
    }
  }

  public updateItemState(item: INavItem): void {
    this._incUpdatingCount()

    try {
      setDefaultHorizontalNavItemState(item)

      if (isHorizontalNavItemType(item, 'link')) {
        const url = this._getUrl(item)
        if (notNullOrUndefined(url)) {
          const opts = this._getMatchOptions(item)
          this.setItemStateProp(item, 'active', this._router.isActive(url, opts))
        }
      }

      // TODO: Implement this in a more optimized way. Unless our apps start
      // having large navs constantly updating their state, this shouldn't
      // have much impact on performance.
      this._updateItemExpandedState(item)

      this._decrUpdatingCount()
    } catch (err) {
      this._decrUpdatingCount()
      throw err
    }
  }

  private _updateItemsExpandedState(items: INavItem[]): void {
    for (const item of items) {
      if (horizontalNavItemHasChildren(item)) {
        this._updateItemsExpandedState(item.children)
      }
      this._updateItemExpandedState(item)
    }
  }

  private _updateItemExpandedState(item: INavItem): void {
    if (!horizontalNavItemCanExpand(item)) {
      if (getHorizontalNavItemStateProp(item, 'expanded')) {
        this.setItemStateProp(item, 'expanded', false)
      }
      return
    }

    if (horizontalNavItemHasChildren(item)) {
      this._updateItemsExpandedState(item.children)
    }

    if (horizontalNavItemHasActiveChild(item) || horizontalNavItemHasExpandedChild(item)) {
      if (!getHorizontalNavItemStateProp(item, 'expanded')) {
        this.setItemStateProp(item, 'expanded', true)
      }
    } else {
      if (getHorizontalNavItemStateProp(item, 'expanded')) {
        this.setItemStateProp(item, 'expanded', false)
      }
    }
  }

  private _getNavExtras(item: INavLink): UrlCreationOptions {
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

  private _getUrl(item: INavLink): string | null {
    const link = item.link

    if (typeof link === 'string') {
      return this._router.createUrlTree([ link ], this._getNavExtras(item)).toString()
    } else if (Array.isArray(link)) {
      return this._router.createUrlTree(link, this._getNavExtras(item)).toString()
    }

    return null
  }

  private _getMatchOptions(item: INavLink): IsActiveMatchOptions {
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

  public setItemStateProp<K extends keyof INavItemState>(item: INavItem, prop: K, value: INavItemState[K]): void {
    const currentValue = getHorizontalNavItemStateProp(item, prop)
    if (currentValue !== value) {
      setHorizontalNavItemStateProp(item, prop, value)

      const changed: NavItemStateChanged = {
        item,
        prop,
        prevValue: currentValue,
        newValue: value
      }
      this.itemChanged.next(changed)
    }
  }
}
