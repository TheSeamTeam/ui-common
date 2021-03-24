import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'seam-widget-description',
  templateUrl: './widget-description.component.html',
  styleUrls: ['./widget-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetDescriptionComponent { }
