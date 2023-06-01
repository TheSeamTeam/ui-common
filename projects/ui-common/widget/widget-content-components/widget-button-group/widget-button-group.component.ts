import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'seam-widget-button-group',
  templateUrl: './widget-button-group.component.html',
  styleUrls: ['./widget-button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetButtonGroupComponent { }
