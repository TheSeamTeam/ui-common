import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Inject, Injectable, isDevMode, Optional } from '@angular/core'
import { from } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { isAbsoluteUrl } from '@lib/ui-common/utils'

import { DynamicValueHelperService } from '../../dynamic-value-helper.service'
import { DynamicActionUiButtonDef } from '../../models/dynamic-action-ui-button-def'
import { DynamicValue } from '../../models/dynamic-value'
import { IApiConfig, THESEAM_API_CONFIG } from '../../tokens/api-config'

import { DynamicActionApi } from './dynamic-action-api'
import { DynamicActionApiDef } from './dynamic-action-api-def'
import { dynamicActionApiNotSupportedError } from './dynamic-action-api-errors'

/**
 * Handles execution of api call actions.
 *
 * This action service should be generic enough to
 * work with any url endpoint, but will be biased towards our api where needed.
 */
@Injectable()
export class DynamicActionApiService implements DynamicActionApi {

  readonly type = 'api'

  label = 'Api Action'

  constructor(
    private _valueHelper: DynamicValueHelperService,
    @Optional() private _http: HttpClient,
    @Optional() @Inject(THESEAM_API_CONFIG) private _configs: IApiConfig[]
  ) { }

  public exec(args: DynamicActionApiDef, context: any): Promise<any> {
    if (!this._isSupported()) {
      throw dynamicActionApiNotSupportedError()
    }

    return from(this._getExecInfo(args, context)).pipe(
      switchMap(x => this._http.request<any>(x.method, x.url, x.options)),
    ).toPromise()
  }

  public async getUiProps(args: DynamicActionApiDef, context: any): Promise<DynamicActionUiButtonDef> {
    return {
      _actionDef: args,
      triggerType: 'click'
    }
  }

  private async _getExecInfo(args: DynamicActionApiDef, context?: any) {
    const method = args.method || 'GET'

    const url = await this._getUrl(args, context)
    if (url === null) {
      throw new Error('[DynamicActionApiService] Unable to determine url.')
    }

    const body = await this._getBody(args, context)
    const params = await this._getParams(args, context)

    const headers = await this._getHeaders(args, context)

    const result = {
      url,
      method,
      options: { body, params, headers }
    }

    return result
  }

  private async _getUrl(args: DynamicActionApiDef, context?: any): Promise<string | null> {
    const config = this._getApiConfig(args)

    let endpoint = ''
    if (args.endpoint) {
      endpoint = await this._valueHelper.eval(args.endpoint, context)
    }

    if (isAbsoluteUrl(endpoint)) {
      return endpoint
    }

    if (config && config.url !== undefined && config.url !== null) {
      const url = await this._valueHelper.eval(config.url, context)
      if (typeof url === 'string') {
        const addSlash = endpoint.length > 0 && endpoint.indexOf('/') !== 0 &&
          url.length > 0 && url.indexOf('/') !== 0
        return `${config.url}${addSlash ? '/' : ''}${endpoint}`
      }
    }

    return null
  }

  private _getApiConfig(args: DynamicActionApiDef): IApiConfig | null {
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

  private async _getBody(args: DynamicActionApiDef, context?: any) {
    if (args.body !== undefined && args.body !== null) {
      return await this._valueHelper.eval(args.body, context)
    }

    return undefined
  }

  private async _getParams(args: DynamicActionApiDef, context?: any) {
    if (args.params !== undefined && args.params !== null) {
      return await this._valueHelper.eval(args.params, context)
    }

    return undefined
  }

  private async _getHeaders(args: DynamicActionApiDef, context?: any): Promise<HttpHeaders> {
    let headers: string | { [name: string]: string | string[] } = {}

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
        headers = await this._evalHeaders(h, context)
      }
    }

    // TODO: Cleanup messing multiple level logic
    const argHeaders = args.headers
    if (argHeaders !== undefined && argHeaders !== null) {
      if (typeof argHeaders === 'string') {
        headers = argHeaders
      } else {
        const _val = this._valueHelper.eval(argHeaders as any, context) // TODO: Fix argHeaders type
        if (typeof _val === 'string') {
          headers = _val
        } else {
          const keys = Object.keys(argHeaders)
          for (const key of keys) {
            const value = argHeaders[key]
            if (typeof value === 'string') {
              headers[key] = value
            } else if (Array.isArray(value)) {
              headers[key] = await Promise.all(value.map(async v => await this._valueHelper.eval(v, context)))
            } else {
              headers[key] = await this._valueHelper.eval(value, context)
            }
          }
        }
      }
    }

    return new HttpHeaders(headers)
  }

  private async _evalHeaders(
    headers: string | DynamicValue<string> | { [name: string]: DynamicValue<string> | DynamicValue<string>[] },
    context?: any
  ) {
    let res: string | { [name: string]: string | string[] } = {}

    // TODO: Cleanup messing multiple level logic
    if (typeof headers === 'string') {
      res = headers
    } else {
      const _val = this._valueHelper.eval(headers as any, context) // TODO: Fix argHeaders type
      if (typeof _val === 'string') {
        res = _val
      } else {
        const keys = Object.keys(headers)
        for (const key of keys) {
          const value = headers[key]
          if (typeof value === 'string') {
            res[key] = value
          } else if (Array.isArray(value)) {
            res[key] = await Promise.all(value.map(async v => await this._valueHelper.eval(v, context)))
          } else {
            res[key] = await this._valueHelper.eval(value, context)
          }
        }
      }
    }
    return res
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
