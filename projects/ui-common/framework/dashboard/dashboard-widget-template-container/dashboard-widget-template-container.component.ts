import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, TemplateRef } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { DashboardWidgetsAccessor, THESEAM_DASHBOARD_WIDGETS_ACCESSOR } from '../dashboard-widgets-tokens'
import type { IDashboardWidgetsItem } from '../dashboard-widgets/dashboard-widgets-item'

@Component({
  selector: 'seam-dashboard-widget-template-container',
  templateUrl: './dashboard-widget-template-container.component.html',
  styleUrls: ['./dashboard-widget-template-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetTemplateContainerComponent implements OnInit {

  @Input() item: IDashboardWidgetsItem | undefined | null

  public template$: Observable<TemplateRef<any> | undefined>

  constructor(
    @Inject(THESEAM_DASHBOARD_WIDGETS_ACCESSOR) private readonly _dashboardWidgetsComponent: DashboardWidgetsAccessor
  ) {
    this.template$ = this._dashboardWidgetsComponent.containers$.pipe(
      map(containers => containers.find((c: any) => c.def.widgetId === this.item?.widgetId)),
      map(container => container && container.templateRef)
    )
  }

  ngOnInit() { }

}
