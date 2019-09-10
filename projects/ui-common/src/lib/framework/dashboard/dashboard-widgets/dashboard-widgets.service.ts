import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
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

  constructor() {
    this.widgetItems$ = this._widgets
      .pipe(
        map(defs => defs.map(d => this.createWidgetItem(d)).filter(notNullOrUndefined)),
        tap(items => console.log('items', items))
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
        tap(v => console.log('v', v))
      )
  }

  // public patchWidgets(defs: IDashboardWidgetsItemDef[]) {

  // }

  // TODO: Finish when initial implementation is done.
  // public addWidget(def: IDashboardWidgetsItemDef): Observable<IDashboardWidgetsItem> {
  //   const col = def.col || this.defaultColumn

  //   const widgetsSubject = this._columns.get(col) || new BehaviorSubject<IDashboardWidgetsItem[]>([])

  //   // if () {

  //   // }
  //   const item

  //   const newWidgets = [ ...widgetsSubject.value, this.createWidgetItem() ]
  // }

  // public addWidgets(defs: IDashboardWidgetsItemDef[]): Observable<IDashboardWidgetsItem[]> {

  // }

  public createWidgetItem(def: IDashboardWidgetsItemDef): IDashboardWidgetsItem {
    const item: IDashboardWidgetsItem = {
      ...def,
      col: def.col || this.defaultColumn,
      order: def.order || 0,
      portal: this.createWidgetPortal(def),
      __itemDef: def
    }

    return item
  }

  public createWidgetPortal(def: IDashboardWidgetsItemDef): ComponentPortal<any> {
    let portal: ComponentPortal<any>
    if (def.componentFactoryResolver) {
      portal = new ComponentPortal(def.type, undefined, undefined, def.componentFactoryResolver)
    } else {
      portal = new ComponentPortal(def.type)
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

  // public selectColumns(): Observable<> {
  //   this.widgetItems$
  //     .pipe(

  //     )
  // }

}
