import { Injectable, isDevMode } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import {
  activatedRoutesWithDataProperty,
  hasProperty,
  IActivatedRouteWithData,
  isEmptyUrlRoute,
  leafChildRoute,
  notNullOrUndefined,
  routeSnapshotPathFull,
  willHaveDataProp
} from '@theseam/ui-common/utils'

import { TheSeamBreadcrumb } from './breadcrumb'

interface BreadcrumbDataExtras {
  dataProps?: string[]
}

interface ExtrasPropRef {
  prop: string
  value: Observable<string>
}

interface BreadcrumbData {
  breadcrumb?: string
  breadcrumbExtras?: BreadcrumbDataExtras

  activatedRoute: ActivatedRoute
  extrasPropRefs: ExtrasPropRef[]
}

@Injectable({
  providedIn: 'root'
})
export class TheSeamBreadcrumbsService {

  // public readonly breadcrumbDataKey = 'breadcrumb'

  private readonly dataProps: (keyof Omit<BreadcrumbData, 'activatedRoute'>)[] = [
    'breadcrumb',
    'breadcrumbExtras',
  ]

  public readonly crumbs$: Observable<TheSeamBreadcrumb[]>

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute
  ) {
    // this.crumbs$ = this._router.events.pipe(
    //   filter(event => event instanceof NavigationEnd),
    //   map(_ => this._activatedRoute),
    //   startWith(this._activatedRoute),
    //   activatedRoutesWithDataProperty(this.breadcrumbDataKey, true),
    //   switchMap(rwdArr => combineLatest(rwdArr.map(rwd => this._parseBreadcrumbData(rwd))))
    // )

    this.crumbs$ = this._crumbsFromRoute()
  }

  private _crumbsFromRoute(): Observable<TheSeamBreadcrumb[]> {
    return this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this._activatedRoute),
      startWith(this._activatedRoute),
      switchMap(activatedRoute => this._crumbsFromActivatedRoute(activatedRoute))
    )
  }

  private _crumbsFromActivatedRoute(activatedRoute: ActivatedRoute): Observable<TheSeamBreadcrumb[]> {
    return this._breadcrumbDatasFromRoot(activatedRoute).pipe(
      map(bcDatas => this._breadcrumbsFromData(bcDatas))
    )
  }

  private _breadcrumbDatasFromRoot(activatedRoute: ActivatedRoute): Observable<BreadcrumbData[]> {
    const bcDataObs = leafChildRoute(activatedRoute).pathFromRoot.map(r => this._breadcrumbData(r))
    return combineLatest(bcDataObs).pipe(
      map(v => v.filter(notNullOrUndefined)),
      switchMap(v => this._applyBreadcrumbExtras(v)),
    )
  }

  private _breadcrumbData(activatedRoute: ActivatedRoute): Observable<BreadcrumbData | null> {
    return activatedRoute.data.pipe(
      map(data => {
        const bcData: BreadcrumbData = {
          activatedRoute,
          extrasPropRefs: []
        }

        let found = false
        for (const prop of this.dataProps) {
          if (prop === 'breadcrumb' && !willHaveDataProp(activatedRoute, prop)) {
            // Need to skip if the 'breadcrumb' data prop is not in the config,
            // because we will get duplicates if the data 'breadcrumb' prop is
            // inheritted from a parent route.
            continue
          }

          if (hasProperty(data, prop)) {
            bcData[prop] = data[prop]
            found = true
          }
        }

        if (!found) {
          return null
        }

        bcData.extrasPropRefs = this._getBreadcrumbExtrasDataProps(bcData)

        return bcData
      })
    )
  }

  private _applyBreadcrumbExtras(datas: BreadcrumbData[]): Observable<BreadcrumbData[]> {
    const newDatas: BreadcrumbData[] = []

    let pending: BreadcrumbData[] = []
    for (const data of datas) {
      if (!hasProperty(data, 'breadcrumb')) {
        pending.push(data)
        continue
      }

      newDatas.push(data)

      pending = []
    }

    if (newDatas.length === 0) {
      return of([])
    }

    if (pending.length > 0) {
      // add extras
      newDatas[newDatas.length - 1].extrasPropRefs = this._filterExtrasPropRefs([
        ...newDatas[newDatas.length - 1].extrasPropRefs,
        ...pending.map(p => p.extrasPropRefs).reduce((prev, curr) => [ ...prev, ...curr ], [])
      ])
    }

    return combineLatest(newDatas.map(data => {
      if (data.extrasPropRefs.length === 0) {
        return of(data)
      }

      return this._observeExtrasPropRefs(data.extrasPropRefs).pipe(
        map(extrasStr => {
          data.breadcrumb = `${data.breadcrumb} ${extrasStr}`
          return data
        })
      )
    }))
  }

  private _observeExtrasPropRefs(propRefs: ExtrasPropRef[]): Observable<string> {
    return combineLatest(propRefs.map(pf => pf.value)).pipe(
      map(values => values.map(v => `(${v})`).join(' '))
    )
  }

  private _getBreadcrumbExtrasDataProps(data: BreadcrumbData): ExtrasPropRef[] {
    if (!hasProperty(data, 'breadcrumbExtras')) {
      return []
    }

    if (!hasProperty(data.breadcrumbExtras, 'dataProps')) {
      return []
    }

    const propRefs = data.breadcrumbExtras.dataProps.map(prop => {
      return { prop, value: this._getDataProp(data.activatedRoute, prop) }
    })

    return this._filterExtrasPropRefs(propRefs)
  }

  private _filterExtrasPropRefs(propRefs: ExtrasPropRef[]): ExtrasPropRef[] {
    const seen: { [key: string]: boolean } = { }
    return propRefs.filter(propRef => {
      if (seen[propRef.prop]) {
        return false
      }
      seen[propRef.prop] = true
      return true
    })
  }

  private _getDataProp(activatedRoute: ActivatedRoute, prop: string): Observable<string> {
    if (activatedRoute.routeConfig !== null) {
      if (willHaveDataProp(activatedRoute, prop)) {
        return activatedRoute.data.pipe(map(d => d[prop]))
      }
    }

    let r = activatedRoute.parent
    while (r !== null) {
      if (willHaveDataProp(r, prop)) {
        return r.data.pipe(map(d => d[prop]))
      }

      r = r.parent
    }

    throw Error(`DataProp '${prop}' not found.`)
  }

  private _breadcrumbsFromData(datas: BreadcrumbData[]): TheSeamBreadcrumb[] {
    const breadcrumbs: TheSeamBreadcrumb[] = []

    for (const data of datas) {
      if (hasProperty(data, 'breadcrumb')) {
        const breadcrumb: TheSeamBreadcrumb = {
          value: data.breadcrumb,
          path: routeSnapshotPathFull(data.activatedRoute.snapshot),
          route: data.activatedRoute
        }
        breadcrumbs.push(breadcrumb)
      }
    }

    return breadcrumbs
  }

  // private _parseBreadcrumbData(routeWithData: IActivatedRouteWithData): Observable<TheSeamBreadcrumb> {
  //   const crumbValue = routeWithData.data[this.breadcrumbDataKey]
  //   const route = routeWithData.route
  //   const path = routeSnapshotPathFull(route.snapshot)
  //   let value = ''

  //   if (typeof crumbValue === 'string') {
  //     value = crumbValue
  //   } else {
  //     if (isDevMode()) {
  //       console.warn(
  //         '[TheSeamBreadcrumbsService] Only string breadcrumbs are supported currently. '
  //         + 'Use a resolver if the value needs to be dynamically calculated.'
  //       )
  //     }
  //   }

  //   return of({ value, path, route })
  // }

}
