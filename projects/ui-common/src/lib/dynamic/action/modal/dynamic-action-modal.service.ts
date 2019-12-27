import { Injectable } from '@angular/core'

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

}
