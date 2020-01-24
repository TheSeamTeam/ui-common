import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable, isDevMode, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs'
import { filter, map, mapTo, shareReplay, switchMap, take, tap } from 'rxjs/operators'

import { TheSeamDynamicComponentLoader } from '../../../dynamic-component-loader/dynamic-component-loader.service'
import { notNullOrUndefined } from '../../../utils/index'

import {
  IDashboardWidgetsColumnRecord,
  IDashboardWidgetsItem,
  IDashboardWidgetsItemDef,
  IDashboardWidgetsItemSerialized
} from './dashboard-widgets-item'

@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetsService {

  get widgets(): IDashboardWidgetsItemDef[] { return this._widgets.value }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._widgets.next(value) }
  private _widgets = new BehaviorSubject<IDashboardWidgetsItemDef[]>([])

  public widgetItems$: Observable<IDashboardWidgetsItem[]>
  public widgetColumns$: Observable<IDashboardWidgetsColumnRecord[]>

  /** Used for operations, such as 'addWidget', if the column is not specified. */
  public defaultColumn = 0

  private _viewContainerRefSubject = new BehaviorSubject<ViewContainerRef | undefined>(undefined)

  constructor(
    private _dynamicComponentLoaderModule: TheSeamDynamicComponentLoader
  ) {
    this.widgetItems$ = combineLatest([ this._widgets, this._viewContainerRefSubject ])
      .pipe(
        switchMap(([ defs, vcr ]) => {
          const _createObservables = (defs || []).map(d => this.createWidgetItem(d, vcr))
          return combineLatest(_createObservables).pipe(
            map(items => items.filter(notNullOrUndefined)),
            tap(items => {
              if (isDevMode()) {
                const ids: string[] = items.map(v => v.widgetId)
                if ((new Set(ids)).size !== ids.length) {
                  console.warn(`[DashboardWidgetsService] Duplicate widget's with the same 'widgetId' found.`)
                }
              }
            })
          )
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      )

    this.widgetColumns$ = this.widgetItems$
      .pipe(
        // Distribute items into columns
        map(items => {
          const columns: IDashboardWidgetsColumnRecord[] = []

          for (const item of items) {
            const col: IDashboardWidgetsColumnRecord | undefined = columns.find(c => c.column === item.col)
            if (!col) {
              columns.push({ column: item.col, items: [ item ] })
            } else {
              col.items.push(item)
            }
          }

          return columns
        }),
        // Sort columns
        map(columns => columns.sort((a, b) => a.column - b.column)),
        // Sort columns items
        tap(columns => columns.forEach(col => col.items.sort((a, b) => a.order - b.order))),
        shareReplay({ bufferSize: 1, refCount: true })
      )
  }

  public setViewContainerRef(vcr: ViewContainerRef | undefined) {
    this._viewContainerRefSubject.next(vcr)
  }

  public createWidgetItem(def: IDashboardWidgetsItemDef, vcr?: ViewContainerRef): Observable<IDashboardWidgetsItem | undefined> {
    if (!def.widgetId || typeof def.widgetId !== 'string' || def.widgetId.length < 1) {
      if (isDevMode()) {
        console.warn(`[DashboardWidgetsService] Widget ignored. All widgets must have a 'widgetId'.`, def)
      }
      return of(undefined)
    }

    return this.createWidgetPortal(def, vcr).pipe(
      map(portal => ({
        ...def,
        col: def.col || this.defaultColumn,
        order: def.order || 0,
        portal,
        __itemDef: def
      }))
    )
  }

  public createWidgetPortal(def: IDashboardWidgetsItemDef, vcr?: ViewContainerRef): Observable<ComponentPortal<any>> {
    if (typeof def.component === 'string') {
      return this._dynamicComponentLoaderModule
        .getComponentFactory(def.component)
        .pipe(
          map(componentFactory => {
            return new ComponentPortal(
              componentFactory.componentType,
              vcr,
              undefined,
              (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
            )
          }),
          take(1)
        )
    }

    return def.componentFactoryResolver
      ? of(new ComponentPortal(def.component, vcr, undefined, def.componentFactoryResolver))
      : of(new ComponentPortal(def.component, vcr))
  }

  public updateOrder(): Observable<void> {
    return this.widgetColumns$
      .pipe(
        take(1),
        tap(columns => columns.forEach(col => {
          let i = 0
          col.items.forEach(itm => itm.order = i++)
        })),
        mapTo(undefined)
      )
  }

  /**
   * Returns the serializable widget items as objects that can be serialized to
   * a JSON string for storage.
   */
  public toSerializeableItems(widgets: IDashboardWidgetsItem[]): IDashboardWidgetsItemSerialized[] {
    const serialized: IDashboardWidgetsItemSerialized[] = []
    for (const w of widgets) {
      // if (!w.__itemDef.component || typeof w.__itemDef.component !== 'string') {
      //   console.warn(`[DashboardWidgetsService] Widget item def must have a string 'component' property to be serialized.`, w)
      //   continue
      // }
      // serialized.push({
      //   widgetId: w.widgetId,
      //   col: w.col,
      //   order: w.order,
      //   component: w.__itemDef.component
      // })

      // TODO: Remove this, it is only here for initial dev debugging.
      serialized.push({
        widgetId: w.widgetId,
        col: w.col,
        order: w.order,
        component: w.__itemDef.component as string
      })
    }
    return serialized
  }

  public toDeserializedItems(widgets: IDashboardWidgetsItemSerialized[]): IDashboardWidgetsItemDef[] {
    const items: IDashboardWidgetsItemDef[] = []
    for (const w of widgets) {
      items.push({
        widgetId: w.widgetId,
        col: w.col,
        order: w.order,
        component: w.component
      })
    }
    return items
  }

}
