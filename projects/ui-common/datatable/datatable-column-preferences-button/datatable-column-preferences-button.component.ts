import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

import { faColumns } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'seam-datatable-column-preferences-button',
  templateUrl: './datatable-column-preferences-button.component.html',
  styleUrls: ['./datatable-column-preferences-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableColumnPreferencesButtonComponent implements OnInit {

  icon = faColumns

  constructor() { }

  ngOnInit() { }

}
