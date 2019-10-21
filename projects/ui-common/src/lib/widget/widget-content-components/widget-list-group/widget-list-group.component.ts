import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core'

// TODO: Make `ListGroup` a root component and wrap it with `WidgetListGroup`.

@Component({
  selector: 'seam-widget-list-group',
  templateUrl: './widget-list-group.component.html',
  styleUrls: ['./widget-list-group.component.scss'],
  host: {
    'class': 'list-group'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetListGroupComponent implements OnInit {

  @Input() flush = false

  constructor() { }

  ngOnInit() { }

}
