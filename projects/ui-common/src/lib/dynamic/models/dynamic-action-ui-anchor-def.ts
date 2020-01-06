import { QueryParamsHandling } from '@angular/router'

import { IDynamicActionUiDef } from './dynamic-action-ui-def'
import { DynamicValue } from './dynamic-value'

/**
 * NOTE: Experimental. This feature may change or go away.
 *
 * This model is still being decided and could change as different requirement
 * are learned as the features are being implemented. Since this model is so new
 * there will not be a high priority on keeping this backwards compatibile yet.
 */
export interface IDynamicActionUiAnchorDef extends IDynamicActionUiDef {

  triggerType: 'link' | 'link-external' | 'link-asset'

  /**
   * Depending on the `triggerType` and features available on the component the
   * `linkUrl` may be used differently.
   */
  linkUrl?: string

  /**
   * NOTE: Experimental. This feature may change or go away.
   */
  linkExtras?: {
    /**
     * Value placed on the `target` attribute of an `<a></a>` element.
     *
     * Only for triggerType's 'link', 'link-external'.
     */
    target?: string

    queryParams?: { [k: string]: any }
    fragment?: string
    queryParamsHandling?: QueryParamsHandling
    preserveFragment?: boolean
    skipLocationChange?: boolean
    replaceUrl?: boolean
    state?: { [k: string]: any }
  }

}
