import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable, isDevMode, Optional } from '@angular/core'

import { isAbsoluteUrl } from '../../../utils/index'
import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { DynamicValue } from '../../models/dynamic-value'
import { IApiConfig, THESEAM_API_CONFIG } from '../../tokens/api-config'
import { IDynamicActionApiArgs } from './dynamic-action-api-args'

@Injectable({
  providedIn: 'root'
})
export class DynamicActionApiService {

  constructor(
    private _valueHelper: DynamicValueHelperService,
    @Optional() private _http: HttpClient,
    @Optional() @Inject(THESEAM_API_CONFIG) private _configs: IApiConfig[]
  ) { }

  public handleAction(args: IDynamicActionApiArgs, context?: any) {
    if (!this._isSupported()) {
      return
    }

    const url = this._getUrl(args, context)
    if (url === null) {
      throw new Error('[DynamicActionApiService] Unable to determine url.')
    }

    const body = this._getBody(args, context)
    const params = this._getParams(args, context)

    const headers = this._getHeaders(args, context)

    // this._http.request<any>(method, url, { ...options, headers })
    //   .subscribe()
    //   // .subscribe(v => console.log('v', v))
  }

  private _getUrl(args: IDynamicActionApiArgs, context?: any): string | null {
    const config = this._getApiConfig(args)

    let endpoint = ''
    if (args.endpoint) {
      endpoint = this._valueHelper.eval(args.endpoint, context)
    }

    if (isAbsoluteUrl(endpoint)) {
      return endpoint
    }

    if (config && config.url) {
      const addSlash = endpoint.length > 0 && endpoint.indexOf('/') !== 0
      return `${config.url}${addSlash ? '/' : ''}${endpoint}`
    }

    return null
  }

  private _getApiConfig(args: IDynamicActionApiArgs): IApiConfig | null {
    const configs = this._configs || []

    if (args.id === undefined || args.id === null) {
      return configs.length > 0 ? configs[0] : null
    }

    for (const config of configs) {
      if (config.id && config.id === args.id) {
        return config
      }
    }

    return null
  }

  private _getBody(args: IDynamicActionApiArgs, context?: any) {
    if (args.body !== undefined && args.body !== null) {
      return this._valueHelper.eval(args.body, context)
    }

    return undefined
  }

  private _getParams(args: IDynamicActionApiArgs, context?: any) {
    if (args.params !== undefined && args.params !== null) {
      return this._valueHelper.eval(args.params, context)
    }

    return undefined
  }

  private _getHeaders(args: IDynamicActionApiArgs, context?: any): HttpHeaders {
    let headers: string | { [name: string]: string } = {}

    const config = this._getApiConfig(args)

    // TODO: Make sure I am handling these values correctly. This could be
    // much cleaner. Tests with all the js primitives, null, undefined, and
    // dynamic action types should be written.

    if (config && config.methodHeaders) {
      const method = typeof args.method === 'string'
        ? args.method.trim().toUpperCase()
        : 'GET' // Default method type

      const h = method && config.methodHeaders[method]
      if (h !== undefined && h !== null) {
        headers = this._evalHeaders(h, context)
      }
    }

    const argHeaders = args.headers
    if (argHeaders !== undefined && argHeaders !== null) {
      if (typeof argHeaders === 'string') {
        headers = argHeaders
      } else {
        const _val = this._valueHelper.eval(argHeaders as DynamicValue, context)
        if (typeof _val === 'string') {
          headers = _val
        } else {
          Object.keys(argHeaders).forEach((k, i) => {
            const value = argHeaders[k]
            if (typeof value === 'string') {
              headers[k] = value
            } else if (Array.isArray(value)) {
              headers[k] = value.map(v => this._valueHelper.eval(v as DynamicValue, context))
            } else {
              headers[k] = this._valueHelper.eval(value as DynamicValue, context)
            }
          })
        }
      }
    }

    return new HttpHeaders(headers)
  }

  private _evalHeaders(headers: string | DynamicValue | { [name: string]: DynamicValue | DynamicValue[] }, context?: any) {
    let res: string | { [name: string]: string } = {}
    if (typeof headers === 'string') {
      res = headers
    } else {
      const _val = this._valueHelper.eval(headers as DynamicValue, context)
      if (typeof _val === 'string') {
        res = _val
      } else {
        Object.keys(headers).forEach((k, i) => {
          const value = headers[k]
          if (typeof value === 'string') {
            res[k] = value
          } else if (Array.isArray(value)) {
            res[k] = value.map(v => this._valueHelper.eval(v as DynamicValue, context))
          } else {
            res[k] = this._valueHelper.eval(value as DynamicValue, context)
          }
        })
      }
    }
    return res
  }

  private _evalHeaderVal(value: DynamicValue, context?: any) {

  }

  private _isSupported(): boolean {
    if (isDevMode()) {
      console.warn(`[DynamicActionApiService] Action is not ready for production yet.`)
    } else {
      // I don't expect this to be attempted in prod before completed, so I am just adding a console warning.
      console.warn(`Unable to complete request. Contact support for assistance.`)
    }

    if (!this._http) {
      if (isDevMode()) {
        console.warn(`[DynamicActionApiService] Endpoint actions require \`HttpClientModule\` to be imported.`)
      }
      return false
    }
    return true
  }
}
