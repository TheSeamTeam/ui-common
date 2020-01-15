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
  asset?: DynamicValue<boolean>

  // TODO: Consider if this should have been removed. Now `asset` is used and it
  // is up to the api endpoint to decide if it is encrypted.
  /**
   * Default: false
   */
  // encrypted?: DynamicValue<boolean>

  /**
   *
   * Default: undefined
   */
  target?: DynamicValue<string>

}
