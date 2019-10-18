import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-widget-footer',
  templateUrl: './widget-footer.component.html',
  styleUrls: ['./widget-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetFooterComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
