import { Injectable } from '@angular/core'

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

  constructor() { }

  // exec?: (args: IDynamicActionDef<T>, context: D) => Observable<R>

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: IDynamicActionModalDef, context: any): Promise<IDynamicActionUiButtonDef> {
    return {
      _actionDef: args,
      triggerType: 'click'
    }
  }
}
