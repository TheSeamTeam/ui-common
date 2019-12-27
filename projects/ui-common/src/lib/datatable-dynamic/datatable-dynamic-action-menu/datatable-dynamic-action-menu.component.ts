import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, combineLatest, from, Observable, of } from 'rxjs'
import { concatMap, filter, switchMap, tap, toArray } from 'rxjs/operators'

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'

import { isActionType } from '../../dynamic/utils/index'
import { hasProperty, notNullOrUndefined } from '../../utils/index'

import { DynamicValueHelperService } from '../../dynamic/dynamic-value-helper.service'
import { IDynamicDatatableRow } from '../datatable-dynamic-def'
import { IDynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'
import { IDynamicDatatableRowActionContext } from '../models/dynamic-datatable-row-action-context'

export interface IDynamicDatatableActionMenuRecord {
  /** Row input. */
  _row: IDynamicDatatableRow
  /** Def input. */
  _def: IDynamicDatatableRowAction
  /**
   * Row action.
   */
  rowAction: IDynamicDatatableRowAction
}

@Component({
  selector: 'seam-datatable-dynamic-action-menu',
  templateUrl: './datatable-dynamic-action-menu.component.html',
  styleUrls: ['./datatable-dynamic-action-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDynamicActionMenuComponent implements OnInit {

  faEllipsisH = faEllipsisH

  @Input()
  get row() { return this._row.value }
  set row(value: IDynamicDatatableRow | undefined) { this._row.next(value || undefined) }
  private _row = new BehaviorSubject<IDynamicDatatableRow | undefined>(undefined)

  @Input()
  get actionDefs() { return this._actionDefs.value }
  set actionDefs(value: IDynamicDatatableRowAction[]) { this._actionDefs.next(value || []) }
  private _actionDefs = new BehaviorSubject<IDynamicDatatableRowAction[]>([])

  _menuRecords$: Observable<IDynamicDatatableActionMenuRecord[]>

  /** @ignore */
  _actionMenuPositions = [
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
    private _valueHelper: DynamicValueHelperService
  ) {
    this._menuRecords$ = combineLatest([ this._row, this._actionDefs ]).pipe(
      switchMap(([ row, actionDefs ]) => !!row ? this._mapRecords(row, actionDefs) : of([]))
    )

    // this._menuRecords$
    //   .subscribe(v => console.log('actions', v))
  }

  ngOnInit() { }

  private _mapRecords(
    row: IDynamicDatatableRow,
    actionDefs: IDynamicDatatableRowAction[]
  ): Observable<IDynamicDatatableActionMenuRecord[]> {
    return from(actionDefs).pipe(
      concatMap(actionDef => {
        return (async () => {
          const _rowAction: IDynamicDatatableRowAction = {
            ...actionDef
          }

          const context = this._getRowActionContext(row, actionDef)

          if (hasProperty(_rowAction, 'hidden')) {
            _rowAction.hidden = await this._valueHelper.eval(_rowAction.hidden, context)
            if (_rowAction.hidden) {
              return undefined
            }
          }

          _rowAction.label = await this._valueHelper.eval(actionDef.label, context)

          if (hasProperty(_rowAction, 'disabled')) {
            _rowAction.disabled = await this._valueHelper.eval(_rowAction.disabled, context)
          }

          const record: IDynamicDatatableActionMenuRecord = {
            _row: row,
            _def: actionDef,
            rowAction: _rowAction
          }

          return record
        })()
      }),
      filter(notNullOrUndefined),
      toArray()
    )
  }

  /** @ignore */
  private _getRowActionContext(row: IDynamicDatatableRow, rowActionDef: IDynamicDatatableRowAction): IDynamicDatatableRowActionContext {
    return {
      row
    }
  }

  private _expectedElementType(def: IDynamicDatatableRowAction): 'a' | 'button' {
    const action = def.action

    if (isActionType<'api'>(action, 'api')) {
      return 'button'
    }

    if (isActionType<'modal'>(action, 'modal')) {
      return 'button'
    }

    if (isActionType<'link'>(action, 'link')) {
      if (hasProperty(action, 'encrypted')) {
        return 'button'
      }
      return 'a'
    }

    return 'button'
  }

}
