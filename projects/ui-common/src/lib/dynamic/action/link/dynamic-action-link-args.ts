import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionLinkArgs {

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
