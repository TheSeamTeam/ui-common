import { DynamicActionDef } from './dynamic-action-def'
import { DynamicValue } from './dynamic-value'

/**
 * NOTE: Experimental. This feature may change or go away.
 *
 * This model is still being decided and could change as different requirement
 * are learned as the features are being implemented. Since this model is so new
 * there will not be a high priority on keeping this backwards compatibile yet.
 */
export interface DynamicActionUiDef {

  /** Action def this ui def is for. */
  _actionDef: DynamicActionDef<string>

  triggerType: 'link' | 'link-external' | 'link-asset' | 'click'

  /**
   * NOTE: Experimental. This feature may change or go away.
   *
   * Most UI components will have their own rules, so this may be to generic for
   * a lot of situations.
   *
   * If using an evaluator with a context, such as Jexl, the event will be in
   * the context. This will allow checking event props like which button was
   * pressed or which meta key was held to prevent the action.
   *
   * The evaluator has to be synchronous, because browser events can't be
   * blocked asynchronously.
   *
   * Example: This example shows a click event only executing if button 0 was
   *  used.
   *
   *  {
   *    triggerType: 'click', blockClickExpr: { type: 'jexl', expr: 'event.button ==
   *    0 ? true : false' },
   *    ...
   *  }
   */
  blockClickExpr?: DynamicValue<boolean>

}
