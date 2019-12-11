import { Injectable } from '@angular/core'

import { IDynamicActionModal } from './dynamic-action-modal'
import { IDynamicActionModalArgs } from './dynamic-action-modal-args'

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
}
