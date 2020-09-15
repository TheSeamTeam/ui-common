import { DynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface DynamicActionLinkDef extends DynamicActionDef<'link'> {

  /**
   * Link url.
   */
  link: DynamicValue<string>

  /**
   * If false, the link will use router.
   *
   * Default: false
   */
  external?: DynamicValue<boolean>

  /**
   * Make sure the application provides an `EncryptedAssetReader` that the
   * datatable's injector can find if linking to encrypted data that needs
   * additional information to access the link, such as our assets that require
   * an additional header for decryption.
   *
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

  /**
   * TODO: Finish implementation. This is currently implemented for table cells
   * and when actions started getting shifted to these common action handlers
   * the property was moved here for model compatability, but implementation
   * hasn't moved yet.
   *
   * Default: false
   */
  download?: DynamicValue<boolean>

  /**
   * TODO: Finish implementation. This is currently implemented for table cells
   * and when actions started getting shifted to these common action handlers
   * the property was moved here for model compatability, but implementation
   * hasn't moved yet.
   *
   * Default: true
   */
  detectMimeContent?: DynamicValue<boolean>

}
