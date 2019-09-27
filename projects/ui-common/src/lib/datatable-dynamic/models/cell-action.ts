
// tslint:disable:no-inferrable-types

export class DynamicDatatableCellActionBase<T = string> {
  type: T

  disabled?: boolean = false
}

export class DynamicDatatableCellActionLink extends DynamicDatatableCellActionBase<'link'> {
  link: string

  /**
   * Make sure the application provides an `EncryptedAssetReader` that the
   * datatable's injector can find if linking to encrypted data that needs
   * additional information to access the link, such as our assets that require
   * an additional header for decryption.
   */
  encrypted?: boolean = false

  /**
   * If the link is not going to get handled by the current applications router.
   * If `encrypted` is true, then this may be ignored depending on the
   * `EncryptedAssetReader` implementation.
   */
  external?: boolean = false
}
