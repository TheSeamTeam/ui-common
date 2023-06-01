import { Injectable } from '@angular/core'
import { from, Observable, of } from 'rxjs'
import { map, switchMap, toArray } from 'rxjs/operators'

import { DynamicValueHelperService } from '@theseam/ui-common/dynamic'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { DynamicDatatableRow } from './datatable-dynamic-def'
import { DynamicDatatableDefService } from './dynamic-datatable-def.service'
import { DynamicDatatableRowAction } from './models/dynamic-datatable-row-action'
import { DynamicDatatableRowActionContext } from './models/dynamic-datatable-row-action-context'

@Injectable()
export class DynamicDatatableRowActionsService {

  constructor(
    private _valueHelper: DynamicValueHelperService,
    private _dynamicDef: DynamicDatatableDefService
  ) { }

  /**
   * Observe actions for specified row
   */
  public rowActions(row: DynamicDatatableRow): Observable<DynamicDatatableRowAction[]> {
    return this._dynamicDef.def$.pipe(
      map(def => (def && def.rowActions) ? def.rowActions || [] : []),
      switchMap(rowActions => rowActions
        ? from(rowActions).pipe(
          map(rowAction => {
            if (Object.prototype.hasOwnProperty.call(rowAction, 'hidden')) {
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
  private _getRowActionContext(row: DynamicDatatableRow, rowActionDef: DynamicDatatableRowAction): DynamicDatatableRowActionContext {
    return {
      row
    }
  }

}
