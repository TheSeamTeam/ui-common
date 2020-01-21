import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-widget-tile-group',
  templateUrl: './widget-tile-group.component.html',
  styleUrls: ['./widget-tile-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetTileGroupComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
