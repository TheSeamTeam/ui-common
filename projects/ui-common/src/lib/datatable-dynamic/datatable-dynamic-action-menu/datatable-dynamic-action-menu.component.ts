import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, from, Observable, of } from 'rxjs'
import { concatMap, filter, switchMap, tap, toArray } from 'rxjs/operators'

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'

import { DynamicActionUiDef } from '../../dynamic/models/dynamic-action-ui-def'
import { isActionType } from '../../dynamic/utils/index'
import { hasProperty, notNullOrUndefined } from '../../utils/index'

import { DynamicValueHelperService } from '../../dynamic/dynamic-value-helper.service'
import { DynamicDatatableRow } from '../datatable-dynamic-def'
import { DynamicDatatableRowActionsService } from '../dynamic-datatable-row-actions.service'
import { DynamicDatatableActionMenuElementTypes, DynamicDatatableActionMenuRecord } from '../models/dynamic-datatable-action-menu-record'
import { DynamicDatatableRowAction } from '../models/dynamic-datatable-row-action'
import { DynamicDatatableRowActionContext } from '../models/dynamic-datatable-row-action-context'

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
  set row(value: DynamicDatatableRow | undefined) {
    this._row.next(value || undefined)
  }
  private _row = new BehaviorSubject<DynamicDatatableRow | undefined>(undefined)

  @Input()
  get actionDefs() { return this._actionDefs.value }
  set actionDefs(value: DynamicDatatableRowAction[]) {
    this._actionDefs.next(value || [])
  }
  private _actionDefs = new BehaviorSubject<DynamicDatatableRowAction[]>([])

  _menuRecords$: Observable<DynamicDatatableActionMenuRecord[]>

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
    private _valueHelper: DynamicValueHelperService,
    private _dynamicRowActions: DynamicDatatableRowActionsService
  ) {
    // this._menuRecords$ = combineLatest([ this._row, this._actionDefs ]).pipe(
    //   switchMap(([ row, actionDefs ]) => !!row ? this._mapRecords(row, actionDefs) : of([]))
    // )
    this._menuRecords$ = this._row.pipe(
      switchMap(row => !!row
        ? this._dynamicRowActions.rowActions(row).pipe(
            switchMap(actionDefs => this._mapRecords(row, actionDefs))
          )
        : of([])
      ),
      tap(v => console.log('actions', v))
    )

    // this._menuRecords$.subscribe()
  }

  ngOnInit() { }

  // TODO: Consider moving this to `DynamicDatatableRowActionsService`.
  private _mapRecords<A extends DynamicDatatableRowAction>(
    row: DynamicDatatableRow,
    actionDefs: A[]
  ): Observable<DynamicDatatableActionMenuRecord[]> {
    return from(actionDefs).pipe(
      concatMap(actionDef => {
        return (async () => {
          const _rowAction: DynamicDatatableRowAction = {
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

          const record: DynamicDatatableActionMenuRecord = {
            _row: row,
            _def: actionDef,
            rowAction: _rowAction,
            elementType: this._expectedElementType(actionDef)
          }

          return record
        })()
      }),
      filter(notNullOrUndefined),
      toArray()
    )
  }

  /** @ignore */
  private _getRowActionContext(
    row: DynamicDatatableRow,
    rowActionDef: DynamicDatatableRowAction
  ): DynamicDatatableRowActionContext {
    return {
      row
    }
  }

  private _expectedElementType(def: DynamicDatatableRowAction): DynamicDatatableActionMenuElementTypes {
    const action = def.action

    if (action.type === 'link') {
      if (hasProperty(<any>action, 'asset')) {
        return 'button'
      }
      return 'a'
    }

    return 'button'
  }

}
