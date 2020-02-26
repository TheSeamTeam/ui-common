import { DynamicActionUiDef } from './dynamic-action-ui-def'

/**
 * NOTE: Experimental. This feature may change or go away.
 *
 * This model is still being decided and could change as different requirement
 * are learned as the features are being implemented. Since this model is so new
 * there will not be a high priority on keeping this backwards compatibile yet.
 *
 * TODO: Rename to DynamicActionUiClickDef
 */
export interface DynamicActionUiButtonDef extends DynamicActionUiDef {

  triggerType: 'click'

}
