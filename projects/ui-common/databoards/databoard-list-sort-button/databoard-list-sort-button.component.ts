import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { map, take, tap } from 'rxjs/operators'

import { faSortAlphaDown, faSortAlphaDownAlt } from '@fortawesome/free-solid-svg-icons'

import { observeControlValue } from '@theseam/ui-common/utils'

import { DataboardListComponent } from '../databoard-list/databoard-list.component'
import { THESEAM_DATABOARDLIST_ACCESSOR } from '../tokens/databoard-list-accessor'
import { isNullOrUndefined } from '@marklb/ngx-datatable'
import { ConnectionPositionPair } from '@angular/cdk/overlay'
import { UntypedFormControl } from '@angular/forms'
import { DataboardCardDataProp } from '../models/databoard-data-props'
import { DataboardBoardsAlterationsManagerService } from '../services/databoard-boards-alterations-manager.service'
import { SortBoardsAlteration } from '../models/boards-alterations/sort.boards-alteration'
import { DataFilterSortDirection, DataFilterSortItem } from '@theseam/ui-common/data-filters'
import { SeamIcon } from '@theseam/ui-common/icon'

export interface DataboardSort extends DataboardCardDataProp {
  sortDir?: DataFilterSortDirection
  sortIcon?: SeamIcon
}

@Component({
  selector: 'seam-databoard-list-sort-button',
  templateUrl: './databoard-list-sort-button.component.html',
  styleUrls: ['./databoard-list-sort-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataboardListSortButtonComponent {

  buttonIcon = faSortAlphaDown

  ascIcon = faSortAlphaDown
  descIcon = faSortAlphaDownAlt

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

  @Input() prop: string | undefined

  public dataProps$: Observable<DataboardSort[]>

  // TODO: add visual indicator when a sort is applied but the menu is closed
  public hasActiveSort$: Observable<boolean>

  _filterControl = new UntypedFormControl()

  constructor(
    @Inject(THESEAM_DATABOARDLIST_ACCESSOR) private readonly _databoardList: DataboardListComponent,
    private readonly _boardsAlterationsManager: DataboardBoardsAlterationsManagerService,
  ) {
    const search$ = observeControlValue(this._filterControl)

    this.hasActiveSort$ = this._databoardList.sorts$.pipe(
      map(sorts => sorts.findIndex(s => s.boardProp === this.prop) !== -1)
    )

    this.dataProps$ = combineLatest([ this._databoardList.sorts$, search$ ]).pipe(
      map(([sorts, search]) => {
        const _searchVal = (search || '').trim().toLowerCase()
        return this._databoardList.dataProps
          .filter(c => this._canToggleBoard(c, _searchVal))
          .map(c => {
            const sort = sorts.find(s => s.boardProp === this.prop && s.dataProp === c.prop)
            return {
              ...c,
              sortDir: sort?.dir,
              sortIcon: sort?.dir === 'asc' ? this.ascIcon : sort?.dir === 'desc' ? this.descIcon : null
            } as DataboardSort
          })
      })
    )
  }

  private _canToggleBoard(board: DataboardCardDataProp, filter: string, omitInternalBoards: boolean = true): boolean {
    return this._boardMatchesFilter(board, filter)
  }

  private _boardMatchesFilter(board: DataboardCardDataProp, filter: string): boolean {
    if (filter.length === 0) { return true }

    return `${(board.prop || '')}`.toLowerCase().indexOf(filter) !== -1 || `${(board.name || '')}`.toLowerCase().indexOf(filter) !== -1
  }

  _onChange(dataSort: DataboardSort) {
    this._databoardList.sorts$.pipe(
      take(1),
      tap(sorts => {
        const sortDir = this._toggleSortDir(dataSort)

        const existingSorts = sorts.filter(s => s.boardProp !== this.prop && s.dataProp !== dataSort.prop)
        let newSort: DataFilterSortItem[] = []

        if (!isNullOrUndefined(sortDir)) {
          newSort = [{
            boardProp: this.prop,
            dataProp: dataSort.prop,
            dir: sortDir
          } as DataFilterSortItem]
        }

        const alteration = new SortBoardsAlteration(
          {
            sorts: [ ...existingSorts, ...newSort ]
          },
          true
        )

        this._boardsAlterationsManager.add([ alteration ])
      })
    ).subscribe()
  }

  _clearSorts() {
    this._databoardList.sorts$.pipe(
      take(1),
      tap(sorts => {
        const existingSorts = sorts.filter(s => s.boardProp !== this.prop)

        const alteration = new SortBoardsAlteration(
          {
            sorts: [ ...existingSorts ]
          },
          true
        )

        this._boardsAlterationsManager.add([ alteration ])
      })
    ).subscribe()
  }

  _toggleSortDir(dataSort: DataboardSort): DataFilterSortDirection {
    switch (dataSort.sortDir) {
      case 'asc':
        return 'desc'
      case 'desc':
        return null
      default:
        return 'asc'
    }
  }
}
