import { ComponentPortal } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { notNullOrUndefined } from '../../../utils/index'

import { IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'

@Component({
  selector: 'seam-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetsComponent implements OnInit, OnDestroy {

  @Input()
  get widgets(): IDashboardWidgetsItemDef[] { return this._widgets.value }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._widgets.next(value) }
  private _widgets = new BehaviorSubject<IDashboardWidgetsItemDef[]>([])

  public widgetItems$: Observable<IDashboardWidgetsItem[]>

  constructor() { }

  ngOnInit() {
    this.widgetItems$ = this._widgets
      .pipe(
        untilDestroyed(this),
        map(defs => defs.map(d => this._createWidgetItem(d)).filter(notNullOrUndefined)),
        tap(items => console.log('items', items))
      )

    this.widgetItems$.subscribe()
  }

  ngOnDestroy() { }

  private _createWidgetItem(def: IDashboardWidgetsItemDef): IDashboardWidgetsItem {
    let portal: ComponentPortal<any>
    if (def.componentFactoryResolver) {
      portal = new ComponentPortal(def.type, undefined, undefined, def.componentFactoryResolver)
    } else {
      portal = new ComponentPortal(def.type)
    }

    const item: IDashboardWidgetsItem = {
      ...def,
      portal: portal
    }

    return item
  }

}
