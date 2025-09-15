import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

import { IDashboardWidgetsItemDef } from './dashboard-widgets/dashboard-widgets-item'
import { DashboardWidgetsComponent } from './dashboard-widgets/dashboard-widgets.component'

@Component({
  selector: 'seam-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DashboardWidgetsComponent,
  ],
})
export class DashboardComponent {
  @Input() widgets: IDashboardWidgetsItemDef[] | undefined | null
  @Input() @InputBoolean() widgetsDraggable = true
}
