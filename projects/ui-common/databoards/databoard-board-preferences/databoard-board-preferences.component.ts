import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { combineLatest, Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

import { notNullOrUndefined, observeControlValue } from '@theseam/ui-common/utils'

import { DataboardBoardsAlterationsManagerService } from '../services/databoard-boards-alterations-manager.service'
import { DataboardListComponent } from '../databoard-list/databoard-list.component'
import { THESEAM_DATABOARDLIST_ACCESSOR } from '../tokens/databoard-list-accessor'
import { DataboardBoard } from '../models/databoard-board'
import { getBoardProp } from '../utils/get-board-prop'
import { HideBoardBoardsAlteration } from '../models/boards-alterations/hide-board.boards-alteration'

@Component({
  selector: 'seam-databoard-board-preferences',
  templateUrl: './databoard-board-preferences.component.html',
  styleUrls: ['./databoard-board-preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataboardBoardPreferencesComponent {
  _boards$: Observable<DataboardBoard[]>

  _filterControl = new UntypedFormControl()

  constructor(
    @Inject(THESEAM_DATABOARDLIST_ACCESSOR) private _databoardList: DataboardListComponent,
    private readonly _boardsAlterationsManager: DataboardBoardsAlterationsManagerService,
  ) {
    this._boards$ = combineLatest([
      this._databoardList.boards$ ?? of([]),
      observeControlValue<string>(this._filterControl)
    ]).pipe(
      map(([ boards, filter ]) => {
        const _filter = (filter || '').trim().toLowerCase()
        return boards
          .filter(c => this._canToggleBoard(c, _filter))
      }),
    )
  }

  private _canToggleBoard(board: DataboardBoard, filter: string, omitInternalBoards: boolean = true): boolean {
    return this._boardMatchesFilter(board, filter)
  }

  private _boardMatchesFilter(board: DataboardBoard, filter: string): boolean {
    if (filter.length === 0) { return true }

    return `${(getBoardProp(board) || '')}`.toLowerCase().indexOf(filter) !== -1
  }

  _onChange(event: any, board: DataboardBoard) {
    const boardProp = getBoardProp(board)
    const hidden = !event.checked

    if (!notNullOrUndefined(boardProp)) {
      throw Error(`Unable to get board prop.`)
    }

    const alteration = new HideBoardBoardsAlteration(
      {
        boardProp,
        hidden
      },
      hidden
    )

    this._boardsAlterationsManager.add([ alteration ])
  }

}
