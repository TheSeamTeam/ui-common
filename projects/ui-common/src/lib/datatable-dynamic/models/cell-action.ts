import { ComponentType } from '@angular/cdk/portal'

import { IDynamicActionConfirmDef } from '../../dynamic/models/dynamic-action-confirm-def'

import { IJexlExprDef } from './jexl-expr-def'

// tslint:disable:no-inferrable-types

export class DynamicDatatableCellActionBase<T = string> {
  type: T

  /**
   * If defined, the action must be confirmed.
   */
  confirmDef?: IDynamicActionConfirmDef

  disabled?: boolean = false
}

export class DynamicDatatableCellActionLink extends DynamicDatatableCellActionBase<'link'> {
  link: string | IJexlExprDef

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

  download?: boolean = false

  detectMimeContent?: boolean = true
}

export class DynamicDatatableCellActionModal extends DynamicDatatableCellActionBase<'modal'> {
  component: string | ComponentType<{}>

  data?: any

  resultActions?: {
    [result: string]: DynamicDatatableCellActionModal
  }
}
