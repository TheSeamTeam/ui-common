import { ConnectionPositionPair } from '@angular/cdk/overlay'
import { ChangeDetectionStrategy, Component } from '@angular/core'

import { faColumns } from '@fortawesome/free-solid-svg-icons'

import { ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'

@Component({
  selector: 'seam-datatable-column-preferences-button',
  templateUrl: './datatable-column-preferences-button.component.html',
  styleUrls: ['./datatable-column-preferences-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableColumnPreferencesButtonComponent {

  icon = faColumns

  /** @ignore */
  _actionMenuPositions: ConnectionPositionPair[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ]

  constructor(
    private readonly _columnsAlterationsManager: ColumnsAlterationsManagerService,
  ) { }

  _resetColumns(event: any) {
    this._columnsAlterationsManager.clear()
  }

}
