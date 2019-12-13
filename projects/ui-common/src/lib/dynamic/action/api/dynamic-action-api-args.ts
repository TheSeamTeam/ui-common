import { IDynamicActionDef } from '../../models/dynamic-action-def'
import { DynamicValue } from '../../models/dynamic-value'

export interface IDynamicActionApiArgs extends IDynamicActionDef {
  /**
   * Id to identify which `THESEAM_API_CONFIG` to use. If not provided, the first
   * provided config will be used.
   */
  id?: string

  /**
   * Api endpoint.
   *
   * The endpoint will be appended to the base api url if provided. The base api
   * url can be provided by injecting the `THESEAM_BASE_API_URL` token.
   *
   * If endpoint is absolute then it will not be appended to base api url.
   *
   * NOTE: Some absolute url formats may not be detected, but most formats used
   * by web applications should be detected.
   */
  endpoint?: DynamicValue

  /**
   * Defaults to 'GET'
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

  body?: DynamicValue

  params?: DynamicValue

  /**
   * `DynamicValue` type definition still needs some work to define the
   * evaluated type, but in this case `DynamicValue` should result in a
   * `string`.
   */
  headers?: string | DynamicValue | { [name: string]: DynamicValue | DynamicValue[] }
}
