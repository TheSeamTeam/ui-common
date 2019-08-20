import { Component, HostBinding, OnInit } from '@angular/core'

@Component({
  selector: 'seam-widget-header-badge',
  templateUrl: './widget-header-badge.component.html',
  styleUrls: ['./widget-header-badge.component.scss']
})
export class WidgetHeaderBadgeComponent implements OnInit {

  @HostBinding('class.badge') _badgeCss = true
  @HostBinding('class.float-right') _floatRightCss = true

  constructor() { }

  ngOnInit() {
  }

}
