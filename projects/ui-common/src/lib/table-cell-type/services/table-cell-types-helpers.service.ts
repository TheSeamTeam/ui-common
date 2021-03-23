import { Injectable } from '@angular/core'
import { from, Observable, Subject, Subscriber } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { DynamicActionHelperService, DynamicActionModalDef, DynamicValueHelperService } from '@lib/ui-common/dynamic'

import { TableCellTypeConfig } from '../table-cell-type-config'
import { CaluclatedValueContextType, ICalucatedValueContext, TableCellData } from '../table-cell-type-models'
import { TableCellTypeName } from '../table-cell-type-name'

@Injectable({
  providedIn: 'root'
})
export class TableCellTypesHelpersService {

  constructor(
    private _dynamicActionHelper: DynamicActionHelperService,
    private _valueHelper: DynamicValueHelperService
  ) { }

  public parseValueProp(value: any, contextOrContextFn: CaluclatedValueContextType) {
    const context = this._resolveValueContext(contextOrContextFn)
    return this._valueHelper.evalSync(value, context)
  }

  public getValueContext<T extends TableCellTypeName>(value: any, data?: TableCellData<T, TableCellTypeConfig<T>>): ICalucatedValueContext {
    return {
      row: data && data.row,
      rowIndex: data && data.rowIndex,
      colData: data && data.colData,
      value: value
    }
  }

  private _resolveValueContext(contextOrContextFn: CaluclatedValueContextType) {
    let context = contextOrContextFn
    if (typeof context === 'function') {
      context = context()
    }
    return context
  }

  public handleModalAction<R = any>(
    action: DynamicActionModalDef,
    contextOrContextFn: CaluclatedValueContextType
  ) {
    // TODO: Try to simplify this observable. It seems fairly easy to read like
    // this, but seems like it is doing more than it needs to with the multiple
    // subjects.
    return new Observable((subscriber: Subscriber<R>) => {
      // Passed to helper function to emit results to subscriber.
      const resultSubject = new Subject<any>()
      // Used to stop observing.
      const stopSubject = new Subject<any>()

      // Observe results to emit to subscriber.
      resultSubject
        .pipe(takeUntil(stopSubject))
        .subscribe(
          result => subscriber.next(result),
          err => subscriber.error(err),
          () => stopSubject.complete()
        )

      // Handle the potentially deep chain of actions.
      this._handleModalAction(action, contextOrContextFn, resultSubject)
        .pipe(takeUntil(stopSubject))
        .subscribe(
          () => {},
          err => subscriber.error(err),
          () => subscriber.complete()
        )

      // Clean up on unsubscribe.
      return () => {
        stopSubject.next(undefined)
        stopSubject.complete()
      }
    })
  }

  private _handleModalAction(
    action: DynamicActionModalDef,
    contextOrContextFn: CaluclatedValueContextType,
    resultSubject: Subject<any>
  ) {
    const context = this._resolveValueContext(contextOrContextFn)
    return from(this._dynamicActionHelper.exec(action, context))
  }
}
