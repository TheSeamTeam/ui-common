import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core'

import type { IDashboardWidgetsItemDef } from '../dashboard-widgets/dashboard-widgets-item'

@Component({
  selector: 'seam-dashboard-widget-container',
  templateUrl: './dashboard-widget-container.component.html',
  styleUrls: ['./dashboard-widget-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetContainerComponent {

  @Input() def: IDashboardWidgetsItemDef | undefined | null

  @ViewChild(TemplateRef) templateRef?: TemplateRef<any>

}
