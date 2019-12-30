import { Injectable } from '@angular/core'
import { from, Observable, of } from 'rxjs'
import { map, switchMap, toArray } from 'rxjs/operators'

import { DynamicValueHelperService } from '../dynamic/dynamic-value-helper.service'
import { notNullOrUndefined } from '../utils/index'

import { IDynamicDatatableRow } from './datatable-dynamic-def'
import { DynamicDatatableDefService } from './dynamic-datatable-def.service'
import { IDynamicDatatableRowActionContext } from './models/index'
import { IDynamicDatatableRowAction } from './models/index'

@Injectable()
export class DynamicDatatableRowActionsService {

  constructor(
    private _valueHelper: DynamicValueHelperService,
    private _dynamicDef: DynamicDatatableDefService
  ) { }

  /**
   * Observe actions for specified row
   */
  public rowActions(row: IDynamicDatatableRow): Observable<IDynamicDatatableRowAction[]> {
    return this._dynamicDef.def$.pipe(
      map(def => (def && def.rowActions) ? def.rowActions || [] : []),
      switchMap(rowActions => !!rowActions
        ? from(rowActions).pipe(
          map(rowAction => {
            if (rowAction.hasOwnProperty('hidden')) {
              if (typeof rowAction.hidden === 'boolean') {
                return rowAction.hidden ? undefined : rowAction
              } else {
                const context = this._getRowActionContext(row, rowAction)
                // TODO: Fix async eval
                const isHidden = this._valueHelper.evalSync(rowAction.hidden, context)
                return isHidden ? undefined : rowAction
              }
            }
            return rowAction
          }),
          toArray(),
          map(v => v.filter(notNullOrUndefined))
        )
        : of([])
      )
    )
  }

  /** @ignore */
  private _getRowActionContext(row: IDynamicDatatableRow,  rowActionDef: IDynamicDatatableRowAction): IDynamicDatatableRowActionContext {
    return {
      row
    }
  }

}
