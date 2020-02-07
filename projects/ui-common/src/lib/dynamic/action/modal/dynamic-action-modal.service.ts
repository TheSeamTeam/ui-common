import { Injectable } from '@angular/core'

import { TheSeamDynamicComponentLoader } from '../../../dynamic-component-loader/dynamic-component-loader.service'
import { Modal } from '../../../modal/modal.service'
import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { IDynamicActionUiButtonDef } from '../../models/dynamic-action-ui-button-def'
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
    private _modal: Modal,
    private _dynamicComponentLoader: TheSeamDynamicComponentLoader,
  ) { }

  async exec(args: IDynamicActionModalDef, context: any): Promise<any> {
    console.log('[DynamicActionModalService] exec:', args, context)
    let modal = args && args.modal
    if (modal) {
      modal = this._valueHelper.evalSync(modal, context)
    }
    console.log('modal', modal)
    if (typeof modal === 'string') {
      this._dynamicComponentLoader.getComponentFactory(modal)
        .subscribe(componentFactory => {
          const factoryResolver = (<any /* ComponentFactoryBoundToModule */>componentFactory).ngModule.componentFactoryResolver
          this._modal.openFromComponent(componentFactory.componentType, undefined, factoryResolver)
        })
    } else {
      this._modal.openFromComponent(modal)
    }
  }

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: IDynamicActionModalDef, context: any): Promise<IDynamicActionUiButtonDef> {
    return {
      _actionDef: args,
      triggerType: 'click'
    }
  }
}
