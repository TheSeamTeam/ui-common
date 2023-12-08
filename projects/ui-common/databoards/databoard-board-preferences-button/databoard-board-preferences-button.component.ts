import { ConnectionPositionPair } from '@angular/cdk/overlay'
import { ChangeDetectionStrategy, Component } from '@angular/core'

import { faCogs } from '@fortawesome/free-solid-svg-icons'

import { DataboardBoardsAlterationsManagerService } from '../services/databoard-boards-alterations-manager.service'

@Component({
  selector: 'seam-databoard-board-preferences-button',
  templateUrl: './databoard-board-preferences-button.component.html',
  styleUrls: ['./databoard-board-preferences-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataboardBoardPreferencesButtonComponent {

  icon = faCogs

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
    private readonly _boardsAlterationsManager: DataboardBoardsAlterationsManagerService,
  ) { }

  _resetBoards(event: any) {
    this._boardsAlterationsManager.clear()
  }

}
