import { InjectionToken } from '@angular/core'

import { DynamicValue } from '../models/dynamic-value'

export type ApiRequestMethodHeader = string | { [name: string]: string | string[] }

export interface ApiRequestMethodHeaders {
  'GET'?: ApiRequestMethodHeader
  'POST'?: ApiRequestMethodHeader
  'PUT'?: ApiRequestMethodHeader
  'PATCH'?: ApiRequestMethodHeader
  'DELETE'?: ApiRequestMethodHeader
}

export const VALID_REQUEST_METHODS: (keyof ApiRequestMethodHeaders)[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
]

export function isValidRequestMethod(method: string): method is keyof ApiRequestMethodHeaders {
  return VALID_REQUEST_METHODS.indexOf(method as any) !== -1
}

export interface IApiConfig {
  /**
   * Used to identify this config if multiple are provided.
   */
  id?: string

  /**
   * Base url that non-absolute endpoints will be appended to.
   */
  url?: DynamicValue<string>

  /**
   * Default headers to add to requests.
   */
  methodHeaders?: ApiRequestMethodHeaders
}

export const THESEAM_API_CONFIG_DEFAULT: IApiConfig = {
  url: '/',

  methodHeaders: {
    'GET': { 'Content-Type': 'application/json' },
    'POST': { 'Content-Type': 'application/json' },
    'PUT': { 'Content-Type': 'application/json' },
    'PATCH': { 'Content-Type': 'application/json' },
    'DELETE': { 'Content-Type': 'application/json' }
  }
}

// export const THESEAM_API_CONFIG = new InjectionToken<IApiConfig[]>(
//   'Api config token, config options for actions that make an api request in library'
// )

export const THESEAM_API_CONFIG = new InjectionToken<IApiConfig[]>(
  'Api config token, config options for actions that make an api request in library', {
    providedIn: 'root',
    factory: () => [ THESEAM_API_CONFIG_DEFAULT ]
  })
