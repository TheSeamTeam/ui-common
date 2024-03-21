import { Inject, Injectable, InjectionToken, LOCALE_ID, Optional } from '@angular/core'
import { from, Observable, of } from 'rxjs'

import { TheSeamGoogleMapsApiLoader } from './google-maps-api-loader'

interface GoogleMapsWindow extends Window {
  gm_authFailure?: () => void
  google?: typeof google
}

declare const window: GoogleMapsWindow

/**
 * Token for the config of the LazyMapsAPILoader. Please provide an object of
 * type {@link TheSeamLazyMapsApiLoader}.
 */
export const THESEAM_LAZY_MAPS_API_CONFIG = new InjectionToken<TheSeamLazyMapsApiLoaderConfig>('THESEAM_LAZY_MAPS_API_CONFIG')

/**
 * Configuration for the {@link TheSeamLazyMapsApiLoader}.
 */
export interface TheSeamLazyMapsApiLoaderConfig {
  /**
   * The Google Maps API Key (see:
   * https://developers.google.com/maps/documentation/javascript/get-api-key)
   */
  apiKey?: string

  /**
   * The Google Maps client ID (for premium plans). When you have a Google Maps
   * APIs Premium Plan license, you must authenticate your application with
   * either an API key or a client ID. The Google Maps API will fail to load if
   * both a client ID and an API key are included.
   */
  clientId?: string

  /**
   * The Google Maps channel name (for premium plans). A channel parameter is an
   * optional parameter that allows you to track usage under your client ID by
   * assigning a distinct channel to each of your applications.
   */
  channel?: string

  /**
   * Google Maps API version.
   */
  apiVersion?: string

  /**
   * Url used for the `<script>` tag.
   */
  url?: string

  /**
   * Defines which Google Maps libraries should get loaded.
   */
  libraries?: string[]

  /**
   * The default bias for the map behavior is US. If you wish to alter your
   * application to serve different map tiles or bias the application, you can
   * overwrite the default behavior (US) by defining a `region`. See
   * https://developers.google.com/maps/documentation/javascript/basics#Region
   */
  region?: string

  /**
   * The Google Maps API uses the browser's preferred language when displaying
   * textual information. If you wish to overwrite this behavior and force the
   * API to use a given language, you can use this setting. See
   * https://developers.google.com/maps/documentation/javascript/basics#Language
   */
  language?: string

  loading?: string
}

@Injectable()
export class TheSeamLazyMapsApiLoader extends TheSeamGoogleMapsApiLoader {
  protected _scriptLoadingPromise?: Promise<void>
  protected readonly _config: TheSeamLazyMapsApiLoaderConfig
  protected readonly _SCRIPT_ID: string = 'seamGoogleMapsApiScript'
  protected readonly callbackName: string = `__seamLazyGoogleMapsApiLoader`

  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    @Optional() @Inject(THESEAM_LAZY_MAPS_API_CONFIG) readonly config?: TheSeamLazyMapsApiLoaderConfig,
  ) {
    super()
    this._config = config || {}
  }

  public load(): Observable<void> {
    if (window.google && window.google.maps) {
      // Google maps already loaded on the page.
      return of(undefined)
    }

    if (this._scriptLoadingPromise) {
      return from(this._scriptLoadingPromise)
    }

    // This can happen in HMR situations or Stackblitz.io editors.
    const scriptOnPage = document.getElementById(this._SCRIPT_ID)
    if (scriptOnPage) {
      this._assignScriptLoadingPromise(scriptOnPage)
      return from(this._getScriptLoadingPromise())
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.defer = true
    script.id = this._SCRIPT_ID
    script.src = this._getScriptSrc(this.callbackName)
    this._assignScriptLoadingPromise(script)
    document.body.appendChild(script)
    return from(this._getScriptLoadingPromise())
  }

  private _assignScriptLoadingPromise(scriptElem: HTMLElement) {
    this._scriptLoadingPromise = new Promise((resolve, reject) => {
      const win = window as any
      win[this.callbackName] = () => { resolve() }

      scriptElem.onerror = (error: Event | string) => {
        reject(error)
      }
    })
  }

  private _getScriptLoadingPromise(): Promise<void> {
    if (!this._scriptLoadingPromise) {
      throw Error(`_scriptLoadingPromise has not been assigned.`)
    }
    return this._scriptLoadingPromise
  }

  protected _getScriptSrc(callbackName: string): string {
    const hostAndPath: string = this._config.url || 'https://maps.googleapis.com/maps/api/js'
    const queryParams: { [key: string]: string | string[] | undefined | null } = {
      v: this._config.apiVersion || 'quarterly',
      callback: callbackName,
      key: this._config.apiKey,
      client: this._config.clientId,
      channel: this._config.channel,
      libraries: this._config.libraries,
      region: this._config.region,
      language: this._config.language || (this._localeId !== 'en-US' ? this._localeId : null),
      loading: this._config.loading || 'async'
    }

    const params: string = Object.keys(queryParams)
      // Remove undefined or null params.
      .filter((k: string) => queryParams[k] !== undefined && queryParams[k] !== null)
      // Remove empty arrays.
      .filter((k: string) => {
        const param = queryParams[k]
        return !Array.isArray(param) || param.length > 0
      })
      // Join arrays as comma seperated strings.
      .map((k: string) => {
        const param = queryParams[k]
        return { key: k, value: Array.isArray(param) ? param.join(',') : param } as { key: string, value: string }
      })
      .map((entry: { key: string, value: string }) => {
        return `${entry.key}=${entry.value}`
      })
      .join('&')

    return `${hostAndPath}?${params}`
  }
}
