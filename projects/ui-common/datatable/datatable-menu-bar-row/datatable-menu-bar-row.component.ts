import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-datatable-menu-bar-row',
  templateUrl: './datatable-menu-bar-row.component.html',
  styleUrls: ['./datatable-menu-bar-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableMenuBarRowComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}