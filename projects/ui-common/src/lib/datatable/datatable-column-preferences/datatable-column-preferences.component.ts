import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-datatable-column-preferences',
  templateUrl: './datatable-column-preferences.component.html',
  styleUrls: ['./datatable-column-preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableColumnPreferencesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
