import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { map, mapTo, take, tap } from 'rxjs/operators'

import { notNullOrUndefined } from '../../../utils/index'

import { IDashboardWidgetsColumnRecord, IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'

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

  constructor() {
    this.widgetItems$ = combineLatest([ this._widgets, this._viewContainerRefSubject ])
      .pipe(
        map(([ defs, vcr ]) => {
          // console.log(defs, vcr)
          return (defs || []).map(d => this.createWidgetItem(d, vcr))
            .filter(notNullOrUndefined)
        })
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
        tap(columns => columns.forEach(col => col.items.sort((a, b) => a.order - b.order)))
      )
  }

  public setViewContainerRef(vcr: ViewContainerRef | undefined) {
    this._viewContainerRefSubject.next(vcr)
  }

  public createWidgetItem(def: IDashboardWidgetsItemDef, vcr?: ViewContainerRef): IDashboardWidgetsItem {
    const item: IDashboardWidgetsItem = {
      ...def,
      col: def.col || this.defaultColumn,
      order: def.order || 0,
      portal: this.createWidgetPortal(def, vcr),
      __itemDef: def
    }

    return item
  }

  public createWidgetPortal(def: IDashboardWidgetsItemDef, vcr?: ViewContainerRef): ComponentPortal<any> {
    let portal: ComponentPortal<any>
    if (def.componentFactoryResolver) {
      portal = new ComponentPortal(def.type, vcr, undefined, def.componentFactoryResolver)
    } else {
      portal = new ComponentPortal(def.type, vcr)
    }
    return portal
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

}
