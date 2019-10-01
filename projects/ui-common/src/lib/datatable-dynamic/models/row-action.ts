import { ComponentType } from '@angular/cdk/portal'
import { IDynamicDatatableConfirmDialog } from './confirm-dialog'

// tslint:disable:no-inferrable-types

export class DynamicDatatableRowActionBase<T = string> {
  type: T

  disabled?: boolean = false

  /**
   * Show a confirmation dialog before action is executed.
   *
   * NOTE: May not be supported by all types.
   * TODO: Move to its own interface if class are refactored back to interfaces.
   */
  confirmDialog?: IDynamicDatatableConfirmDialog
}

export class DynamicDatatableRowActionLink extends DynamicDatatableRowActionBase<'link'> {
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

/**
 * Call provided api endpoint.
 */
export class DynamicDatatableRowActionApi extends DynamicDatatableRowActionBase<'api'> {
  /**
   * Api endpoint.
   */
  endpoint?: string

  endpointExpr?: string

  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'

  bodyExpr?: string

  paramsExpr?: string
}

/**
 * Call provided api endpoint.
 */
export class DynamicDatatableRowActionModal extends DynamicDatatableRowActionBase<'modal'> {
  /**
   * Modal Component.
   *
   * If the component class is provided it needs to be an entry component to
   * allow the factory to be found.
   *
   * If passing a string it needs to be provided as a
   * `IDynamicComponentManifest`. Check `TheSeamDynamicComponentLoader` for how
   * to provide a manifest. The component that be lazy loaded this way.
   */
  component: ComponentType<{}> |  string
}
