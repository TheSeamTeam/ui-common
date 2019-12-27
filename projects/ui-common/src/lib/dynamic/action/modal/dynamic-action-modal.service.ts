import { Injectable } from '@angular/core'

import { IDynamicActionUiDef } from '../../models/dynamic-action-ui-def'
import { IDynamicActionModal } from './dynamic-action-modal'
import { IDynamicActionModalDef } from './dynamic-action-modal-def'

/**
 * Handles execution of modal actions.
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicActionModalService implements IDynamicActionModal {

  readonly type = 'modal'

  label = 'Modal Action'

  constructor() { }

  // exec?: (args: IDynamicActionDef<T>, context: D) => Observable<R>

  // execSync?: (args: IDynamicActionDef<T>, context: D) => R

  public async getUiProps(args: IDynamicActionModalDef, context: any): Promise<IDynamicActionUiDef<'modal'>> {
    return {
      type: this.type,
      triggerType: 'link'
    }
  }
}
