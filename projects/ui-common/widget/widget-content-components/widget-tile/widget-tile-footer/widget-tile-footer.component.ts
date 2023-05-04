import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-widget-tile-footer,[seam-widget-tile-footer]',
  templateUrl: './widget-tile-footer.component.html',
  styleUrls: ['./widget-tile-footer.component.scss'],
  host: {
    class: 'd-flex flex-row justify-content-end',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetTileFooterComponent { }
