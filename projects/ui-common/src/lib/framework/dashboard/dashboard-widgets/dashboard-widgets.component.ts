import { ComponentPortal } from '@angular/cdk/portal'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { notNullOrUndefined } from '../../../utils/index'

import { IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'
import { DashboardWidgetsService } from './dashboard-widgets.service'

@Component({
  selector: 'seam-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetsComponent implements OnInit, OnDestroy {

  @Input()
  get widgets(): IDashboardWidgetsItemDef[] { return this._dashboardWidgets.widgets }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._dashboardWidgets.widgets = value }

  public widgetItems$: Observable<IDashboardWidgetsItem[]>

  constructor(
    private _dashboardWidgets: DashboardWidgetsService
  ) { }

  ngOnInit() {
    this.widgetItems$ = this._dashboardWidgets.widgetItems$

    this.widgetItems$.subscribe()
  }

  ngOnDestroy() { }

}
