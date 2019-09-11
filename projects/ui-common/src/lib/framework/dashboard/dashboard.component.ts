import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { IDashboardWidgetsItemDef } from './dashboard-widgets/dashboard-widgets-item'

@Component({
  selector: 'seam-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  @Input() widgets: IDashboardWidgetsItemDef[]

  constructor() { }

  ngOnInit() {
  }

}
