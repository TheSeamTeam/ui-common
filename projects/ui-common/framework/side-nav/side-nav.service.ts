import { Injectable } from '@angular/core'
import { ActivatedRoute, IsActiveMatchOptions, NavigationEnd, Router, UrlCreationOptions } from '@angular/router'
import { BehaviorSubject, combineLatest, Observable, of, Subject, Subscriber } from 'rxjs'
import { distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators'

import { hasProperty, notNullOrUndefined } from '@theseam/ui-common/utils'

import {
  canExpand,
  findLinkItems,
  getItemStateProp,
  hasActiveChild,
  hasChildren,
  hasExpandedChild,
  isNavItemType,
  setDefaultState,
  setItemStateProp
} from './side-nav-utils'
import { ISideNavItem, ISideNavItemState, ISideNavLink, SideNavItemStateChanged } from './side-nav.models'

@Injectable()
export class TheSeamSideNavService {

  private readonly _updatingCount = new BehaviorSubject<number>(0)

  public readonly loading$: Observable<boolean>

  public readonly itemChanged = new Subject<SideNavItemStateChanged>()

  constructor(
    private readonly _router: Router
  ) {
    this.loading$ = this._updatingCount.pipe(
      map(count => count > 0),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  public createItemsObservable(items: ISideNavItem[]): Observable<ISideNavItem[]> {
    return new Observable((subscriber: Subscriber<ISideNavItem[]>) => {
      const stateChangeSub = this.itemChanged.pipe(
        switchMap(() => this.loading$.pipe(filter(loading => !loading)))
      ).subscribe(() => subscriber.next(items))

      try {
        this.updateItemsStates(items)
      } catch (err) {
        subscriber.error(err)
      }

      // const linkItems = findLinkItems(items)

      const routeChangeSub = this._router.events.pipe(
        filter(event => event instanceof NavigationEnd),
      // ).subscribe(() => linkItems.forEach(itm => this.updateItemState(itm)))
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
    })
  }

  private _incUpdatingCount(): void {
    this._updatingCount.next(this._updatingCount.value + 1)
  }

  private _decrUpdatingCount(): void {
    this._updatingCount.next(this._updatingCount.value - 1)
  }

  public updateItemsStates(items: ISideNavItem[]): void {
    this._incUpdatingCount()

    try {
      for (const item of items) {
        if (hasChildren(item)) {
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

  public updateItemState(item: ISideNavItem): void {
    this._incUpdatingCount()

    try {
      setDefaultState(item)

      if (isNavItemType(item, 'link')) {
        const url = this._getUrl(item)
        if (notNullOrUndefined(url)) {
          const opts = this._getMatchOptions(item)
          this.setItemStateProp(item, 'active', this._router.isActive(url, opts))
        }
      }

      // TODO: Implement this in a more optimized way. Unless our apps start
      // having large side-navs constantly updating their state, this shouldn't
      // have much impact on performance.
      this._updateItemExpandedState(item)

      this._decrUpdatingCount()
    } catch (err) {
      this._decrUpdatingCount()
      throw err
    }
  }

  private _updateItemsExpandedState(items: ISideNavItem[]): void {
    for (const item of items) {
      if (hasChildren(item)) {
        this._updateItemsExpandedState(item.children)
      }
      this._updateItemExpandedState(item)
    }
  }

  private _updateItemExpandedState(item: ISideNavItem): void {
    if (!canExpand(item)) {
      if (getItemStateProp(item, 'expanded')) {
        this.setItemStateProp(item, 'expanded', false)
      }
      return
    }

    if (hasChildren(item)) {
      this._updateItemsExpandedState(item.children)
    }

    if (hasActiveChild(item) || hasExpandedChild(item)) {
      if (!getItemStateProp(item, 'expanded')) {
        this.setItemStateProp(item, 'expanded', true)
      }
    } else {
      if (getItemStateProp(item, 'expanded')) {
        this.setItemStateProp(item, 'expanded', false)
      }
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
      return this._router.createUrlTree([ link ], this._getNavExtras(item)).toString()
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

  public setItemStateProp<K extends keyof ISideNavItemState>(item: ISideNavItem, prop: K, value: ISideNavItemState[K]): void {
    const currentValue = getItemStateProp(item, prop)
    if (currentValue !== value) {
      setItemStateProp(item, prop, value)

      const changed: SideNavItemStateChanged = {
        item,
        prop,
        prevValue: currentValue,
        newValue: value
      }
      this.itemChanged.next(changed)
    }
  }
}
