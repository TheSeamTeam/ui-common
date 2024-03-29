import { ComponentType } from '@angular/cdk/portal'
import { Injectable, Injector } from '@angular/core'
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { Modal, ModalConfig, ModalRef } from '@theseam/ui-common/modal'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { DynamicActionUiButtonDef } from '../../models/dynamic-action-ui-button-def'
import { DynamicActionHelperService } from '../dynamic-action-helper.service'
import { DynamicActionModal } from './dynamic-action-modal'
import { DynamicActionModalDef } from './dynamic-action-modal-def'

/**
 * Handles execution of modal actions.
 */
@Injectable()
export class DynamicActionModalService implements DynamicActionModal {

  readonly type = 'modal'

  label = 'Modal Action'

  constructor(
    private _valueHelper: DynamicValueHelperService,
    private _modal: Modal,
    private _injector: Injector
  ) { }

  async exec(args: DynamicActionModalDef, context: any): Promise<any> {
    const component = this._getComponent(args, context)
    const data = this._getData(args, context)

    return this._openModal(component, data).pipe(
      switchMap(modalRef => modalRef.afterClosed().pipe(
        switchMap(result => {
          const resultAction = this._getModalResultAction(args, result)

          // TODO: Come up with a way to pass data from previous action
          if (resultAction) {
            const dynamicActionHelper = this._getDynamicActionHelper()
            return dynamicActionHelper.exec(resultAction, context)
          }
          return of(result)
        })
      ))
    ).toPromise()
  }

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: DynamicActionModalDef, context: any): Promise<DynamicActionUiButtonDef> {
    return {
      _actionDef: args,
      triggerType: 'click'
    }
  }

  /**
   * Get the dynamic action helper from the injector. The injector order causes
   * the dynamic action helper to not be in the injector when the constructor is
   * called.
   */
  private _getDynamicActionHelper(): DynamicActionHelperService {
    return this._injector.get(DynamicActionHelperService)
  }

  private _getComponent(args: DynamicActionModalDef, context: any): string | ComponentType<object> | undefined {
    let component = args && args.component
    if (component) {
      component = this._valueHelper.evalSync(component, context)
    }
    return component
  }

  private _getData(args: DynamicActionModalDef, context: any): any | undefined {
    let data = args && args.data
    if (data) {
      data = this._valueHelper.evalSync(data, context)
    }
    return data
  }

  private _getModalResultAction(args: DynamicActionModalDef, result: any) {
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
