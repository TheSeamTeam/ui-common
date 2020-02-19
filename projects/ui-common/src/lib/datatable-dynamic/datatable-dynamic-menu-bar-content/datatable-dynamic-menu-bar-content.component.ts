import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-datatable-dynamic-menu-bar-content',
  templateUrl: './datatable-dynamic-menu-bar-content.component.html',
  styleUrls: ['./datatable-dynamic-menu-bar-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicMenuBarContentComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
