import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionLinkArgs {
  /**
   * Id to identify which `THESEAM_LINK_CONFIG` to use. If not provided, the first
   * provided config will be used.
   */
  id?: string

}
