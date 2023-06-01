import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'

import { IDashboardWidgetsItemDef } from './dashboard-widgets/dashboard-widgets-item'

@Component({
  selector: 'seam-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  static ngAcceptInputType_val: BooleanInput

  @Input() widgets: IDashboardWidgetsItemDef[] | undefined | null
  @Input() @InputBoolean() widgetsDraggable = true

}
