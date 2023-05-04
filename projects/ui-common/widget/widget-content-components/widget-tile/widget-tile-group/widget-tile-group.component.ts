import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'seam-widget-tile-group',
  templateUrl: './widget-tile-group.component.html',
  styleUrls: ['./widget-tile-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetTileGroupComponent { }
