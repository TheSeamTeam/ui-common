import { InjectionToken } from '@angular/core'

export interface IApiConfig {
  /**
   * Used to identify this config if multiple are provided.
   */
  id?: string

  /**
   * Base url that non-absolute endpoints will be appended to.
   */
  url?: string

  /**
   * Default headers to add to requests.
   */
  methodHeaders?: {
    'GET'?: string | { [name: string]: string | string[] }
    'POST'?: string | { [name: string]: string | string[] }
    'PUT'?: string | { [name: string]: string | string[] }
    'PATCH'?: string | { [name: string]: string | string[] }
    'DELETE'?: string | { [name: string]: string | string[] }
  }
}

export const THESEAM_API_CONFIG_DEFAULT: IApiConfig = {
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
