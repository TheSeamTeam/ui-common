import { IDynamicActionUiDef } from './dynamic-action-ui-def'
import { DynamicValue } from './dynamic-value'

/**
 * NOTE: Experimental. This feature may change or go away.
 *
 * This model is still being decided and could change as different requirement
 * are learned as the features are being implemented. Since this model is so new
 * there will not be a high priority on keeping this backwards compatibile yet.
 *
 * TODO: Rename to IDynamicActionUiClickDef
 */
export interface IDynamicActionUiButtonDef extends IDynamicActionUiDef {

  triggerType: 'click'

}
