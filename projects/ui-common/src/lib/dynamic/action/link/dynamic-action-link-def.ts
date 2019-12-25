import { IDynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionLinkDef extends IDynamicActionDef<'link'> {

  /**
   * Link url.
   */
  link?: DynamicValue

  /**
   * If true, the link will use router.
   */
  external?: DynamicValue

  /**
   *
   */
  encrypted?: DynamicValue

  /**
   *
   */
  target?: DynamicValue

}
