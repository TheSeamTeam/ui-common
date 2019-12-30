import { QueryParamsHandling } from '@angular/router'

import { IDynamicActionDef } from './dynamic-action-def'
import { DynamicValue } from './dynamic-value'

/**
 * NOTE: Experimental. This feature may change or go away.
 *
 * This model is still being decided and could change as different requirement
 * are learned as the features are being implemented. Since this model is so new
 * there will not be a high priority on keeping this backwards compatibile yet.
 */
export interface IDynamicActionUiDef {

  /** Action def this ui def is for. */
  _actionDef: IDynamicActionDef<string>

  triggerType: 'link' | 'link-external' | 'link-asset' | 'click'

}
