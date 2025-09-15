import { ChangeDetectionStrategy, Component, inject, Input, TemplateRef } from '@angular/core'
import { AsyncPipe, NgTemplateOutlet } from '@angular/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { DashboardWidgetsAccessor, THESEAM_DASHBOARD_WIDGETS_ACCESSOR } from '../dashboard-widgets-tokens'
import { IDashboardWidgetsItem } from '../dashboard-widgets/dashboard-widgets-item'

@Component({
  selector: 'seam-dashboard-widget-template-container',
  templateUrl: './dashboard-widget-template-container.component.html',
  styleUrls: ['./dashboard-widget-template-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    AsyncPipe,
  ],
})
export class DashboardWidgetTemplateContainerComponent {

  private readonly _dashboardWidgetsComponent: DashboardWidgetsAccessor = inject(THESEAM_DASHBOARD_WIDGETS_ACCESSOR)

  @Input() item: IDashboardWidgetsItem | undefined | null

  public readonly template$: Observable<TemplateRef<any> | undefined>

  constructor() {
    this.template$ = this._dashboardWidgetsComponent.containers$.pipe(
      map(containers => containers.find((c: any) => c.def.widgetId === this.item?.widgetId)),
      map(container => container && container.templateRef),
    )
  }

}
