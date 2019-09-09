import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { notNullOrUndefined } from '../../../utils/index'

import { IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'

@Injectable({
  providedIn: 'root'
})
export class DashboardWidgetsService {

  get widgets(): IDashboardWidgetsItemDef[] { return this._widgets.value }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._widgets.next(value) }
  private _widgets = new BehaviorSubject<IDashboardWidgetsItemDef[]>([])

  public widgetItems$: Observable<IDashboardWidgetsItem[]>

  private _columns = new Map<number, BehaviorSubject<IDashboardWidgetsItem[]>>()

  /** Used for operations, such as 'addWidget', if the column is not specified. */
  public defaultColumn = 0

  constructor() {
    this.widgetItems$ = this._widgets
      .pipe(
        map(defs => defs.map(d => this.createWidgetItem(d)).filter(notNullOrUndefined)),
        tap(items => console.log('items', items))
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

  // public selectColumns(): Observable<> {
  //   this.widgetItems$
  //     .pipe(

  //     )
  // }

}
