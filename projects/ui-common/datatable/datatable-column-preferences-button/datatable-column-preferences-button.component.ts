import { ConnectionPositionPair } from '@angular/cdk/overlay'
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'

import { faCheck, faColumns } from '@fortawesome/free-solid-svg-icons'

import {
  DatatableComponent,
  THESEAM_DATATABLE,
} from '../datatable/datatable.component'
import { ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'

@Component({
  selector: 'seam-datatable-column-preferences-button',
  templateUrl: './datatable-column-preferences-button.component.html',
  styleUrls: ['./datatable-column-preferences-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DatatableColumnPreferencesButtonComponent {
  icon = faColumns
  checkIcon = faCheck

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
    @Inject(THESEAM_DATATABLE) readonly _datatable: DatatableComponent,
    private readonly _columnsAlterationsManager: ColumnsAlterationsManagerService,
  ) {}

  _resetColumns(event: any) {
    this._columnsAlterationsManager.clear()
  }

  _toggleAutoHeaderHeight() {
    this._datatable.setUserHeaderHeight(
      this._datatable.userHeaderHeight === 'auto' ? undefined : 'auto',
    )
  }
}
