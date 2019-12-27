import { IDynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionLinkDef extends IDynamicActionDef<'link'> {

  /**
   * Link url.
   */
  link: DynamicValue<string>

  /**
   * If true, the link will use router.
   *
   * Default: false
   */
  external?: DynamicValue<boolean>

  /**
   * Default: false
   */
  encrypted?: DynamicValue<boolean>

  /**
   *
   * Default: undefined
   */
  target?: DynamicValue<string>

}
