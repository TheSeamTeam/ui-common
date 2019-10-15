import { Injectable } from '@angular/core'

import jexl from 'jexl'

import { DynamicDatatableCellActionModal } from '../../datatable-dynamic/index'
import { TheSeamDynamicComponentLoader } from '../../dynamic-component-loader/index'
import { Modal, ModalConfig, ModalRef } from '../../modal/index'
import { ITableCellData } from '../../table/table-cell.models'

import { Observable, of, Subject, Subscriber } from 'rxjs'
import { switchMap, takeUntil } from 'rxjs/operators'
import { CaluclatedValueContextType, ICalucatedValueContext } from '../table-cell-types-models'

@Injectable({
  providedIn: 'root'
})
export class TableCellTypesHelpersService {

  constructor(
    private _dynamicComponentLoaderModule: TheSeamDynamicComponentLoader,
    private _modal: Modal,
  ) { }

  public parseValueProp(value: any, contextOrContextFn: CaluclatedValueContextType) {
    if (!value) {
      return
    }

    if (typeof value === 'string') {
      return value
    }

    if (value.type === 'jexl') {
      const context = this._resolveValueContext(contextOrContextFn)
      return jexl.evalSync(value.expr, context)
    }
  }

  public getValueContext(value: any, data?: ITableCellData<any, string>): ICalucatedValueContext {
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
    action: DynamicDatatableCellActionModal,
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
    action: DynamicDatatableCellActionModal,
    contextOrContextFn: CaluclatedValueContextType,
    resultSubject: Subject<any>
  ) {
    const data = this.parseValueProp(action.data, contextOrContextFn)

    return this._handleModalActionOpenModal(action, data).pipe(
      switchMap(modalRef => modalRef.afterClosed().pipe(
        switchMap(result => {
          resultSubject.next(result)

          const resultAction = this._getModalResultAction(action, result)
          if (resultAction) {
            return this._handleModalAction(resultAction, contextOrContextFn, resultSubject)
          }

          resultSubject.complete()
          return of(undefined)
        })
      ))
    )
  }

  private _handleModalActionOpenModal(action: DynamicDatatableCellActionModal, data?: any): Observable<ModalRef<any, any>> {
    if (!action.component) {
      throw new Error('Cell action type "modal" must have a component defined.')
    }

    const config: ModalConfig<any> = {
      modalSize: 'lg',
      data
    }

    if (typeof action.component === 'string') {
      return this._dynamicComponentLoaderModule
        .getComponentFactory<{}>(action.component)
        .pipe(
          switchMap(componentFactory => {
            const modalRef = this._modal.openFromComponent(
              componentFactory.componentType,
              config,
              (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
            )
            return of(modalRef)
          })
        )
    } else {
      const modalRef = this._modal.openFromComponent(action.component, config)
      return of(modalRef)
    }
  }

  private _getModalResultAction(action: DynamicDatatableCellActionModal, result: any) {
    if (
      action.resultActions
      && action.resultActions[result]
      && action.resultActions[result].type === 'modal'
    ) {
      return action.resultActions[result]
    }
  }
}
