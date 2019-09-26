import { IDynamicDatatableCellType } from './cell-type'

import { TheSeamIconType } from '../../icon/index'

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

export class DynamicDatatableCellTypeConfig<T = IDynamicDatatableCellType> {
  type: T

  /**
   * Styles added to the root cell elements `style` attribute.
   */
  styles?: string | string[]

  /**
   * Classes added to the root cell elements `class` attribute.
   */
  cssClass?: string | string[]
}

export class DynamicDatatableCellTypeConfigString extends DynamicDatatableCellTypeConfig<'string'> {
  // truncate?: boolean = false
}

export class DynamicDatatableCellTypeConfigInteger extends DynamicDatatableCellTypeConfig<'integer'> {

}

export class DynamicDatatableCellTypeConfigDecimal extends DynamicDatatableCellTypeConfig<'decimal'> {

}

export class DynamicDatatableCellTypeConfigDate extends DynamicDatatableCellTypeConfig<'date'> {
  format?: string = 'MM-dd-yyyy h:mm aaa'
}

export type DynamicDatatableCellTypeConfigIconAction = DynamicDatatableCellActionLink

export class DynamicDatatableCellTypeConfigIcon extends DynamicDatatableCellTypeConfig<'icon'> {
  action?: DynamicDatatableCellTypeConfigIconAction

  /**
   * Element title attribute.
   */
  titleAttr?: string

  /**
   * Screen-reader text.
   */
  srOnly?: string

  /**
   * Css class added to the link element.
   */
  linkClass?: string

  /**
   * seam-icon `iconClass` input.
   */
  iconClass?: string

  /**
   * Can apply pre-defined icon styles.
   */
  iconType?: TheSeamIconType
}

// export class DynamicDatatableCellTypeConfigUrl extends DynamicDatatableCellTypeConfig<'url'> {

// }
