import { ComponentType } from '@angular/cdk/portal'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { TheSeamDynamicComponentLoader } from '../../../dynamic-component-loader/dynamic-component-loader.service'
import { ModalConfig } from '../../../modal/modal-config'
import { ModalRef } from '../../../modal/modal-ref'
import { Modal } from '../../../modal/modal.service'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { IDynamicActionUiButtonDef } from '../../models/dynamic-action-ui-button-def'
import { DynamicActionHelperService } from '../dynamic-action-helper.service'
import { IDynamicActionModal } from './dynamic-action-modal'
import { IDynamicActionModalDef } from './dynamic-action-modal-def'

/**
 * Handles execution of modal actions.
 */
@Injectable()
export class DynamicActionModalService implements IDynamicActionModal {

  readonly type = 'modal'

  label = 'Modal Action'

  constructor(
    private _valueHelper: DynamicValueHelperService,
    private _dynamicActionHelper: DynamicActionHelperService,
    private _modal: Modal,
    private _dynamicComponentLoader: TheSeamDynamicComponentLoader,
  ) { }

  async exec(args: IDynamicActionModalDef, context: any): Promise<any> {
    console.log('[DynamicActionModalService] exec:', args, context)

    const component = this._getComponent(args, context)
    const data = this._getData(args, context)
    console.log('component', component, data)

    return this._openModal(component, data).pipe(
      switchMap(modalRef => modalRef.afterClosed().pipe(
        switchMap(result => {
          // resultSubject.next(result)


          const resultAction = this._getModalResultAction(args, result)
          console.log('resultAction', resultAction)
          // if (resultAction) {
          //   return this._handleModalAction(resultAction, contextOrContextFn, resultSubject)
          // }

          // resultSubject.complete()
          // return of(undefined)

          console.log('result', result)

          // TODO: Come up with a way to pass data from previous action
          if (resultAction) {
            console.log('_dynamicActionHelper', this._dynamicActionHelper)
            return this._dynamicActionHelper.exec(resultAction, context)
          }
          return of(result)
        })
      ))
    ).toPromise()
  }

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: IDynamicActionModalDef, context: any): Promise<IDynamicActionUiButtonDef> {
    return {
      _actionDef: args,
      triggerType: 'click'
    }
  }

  private _getComponent(args: IDynamicActionModalDef, context: any): string | ComponentType<{}> | undefined {
    let component = args && args.component
    if (component) {
      component = this._valueHelper.evalSync(component, context)
    }
    return component
  }

  private _getData(args: IDynamicActionModalDef, context: any): any | undefined {
    let data = args && args.data
    if (data) {
      data = this._valueHelper.evalSync(data, context)
    }
    return data
  }

  private _getModalResultAction(args: IDynamicActionModalDef, result: any) {
    if (args.resultActions && args.resultActions[result]) {
      return args.resultActions[result]
    }
  }

  private _openModal(modal: any, data?: any): Observable<ModalRef<any>> {
    // TODO: Replace with JSON valid config from input def model
    const config: ModalConfig = {
      data,
      modalSize: 'lg'
    }

    if (typeof modal === 'string') {
      return this._modal.openFromLazyComponent(modal, config)
    } else {
      return of(this._modal.openFromComponent(modal, config))
    }
  }
}
