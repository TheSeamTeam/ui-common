import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { IDashboardWidgetsColumnRecord, IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'
import { DashboardWidgetsService } from './dashboard-widgets.service'

@Component({
  selector: 'seam-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetsComponent implements OnInit, OnDestroy {

  @Input() gapSize = 60

  @Input()
  get widgets(): IDashboardWidgetsItemDef[] { return this._dashboardWidgets.widgets }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._dashboardWidgets.widgets = value }

  public widgetItems$: Observable<IDashboardWidgetsItem[]>
  public widgetColumns$: Observable<IDashboardWidgetsColumnRecord[]>

  constructor(
    private _dashboardWidgets: DashboardWidgetsService
  ) { }

  ngOnInit() {
    this.widgetItems$ = this._dashboardWidgets.widgetItems$
    this.widgetColumns$ = this._dashboardWidgets.widgetColumns$

    this.widgetItems$.subscribe()
  }

  ngOnDestroy() { }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
      this._dashboardWidgets.updateOrder().subscribe()
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      )
      this._dashboardWidgets.updateOrder().subscribe()
    }
  }

}
