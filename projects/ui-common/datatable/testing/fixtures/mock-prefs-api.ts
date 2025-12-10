import { inject, Injectable, InjectionToken, Provider } from '@angular/core'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { LocalStorageMemory } from '../../../storage/localstorage-memory'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../../tokens/datatable-preferences-accessor'

export interface MockPrefsApiConfigDelaysRange {
  min: number
  max: number
}

/**
 * Mock Preferences API Service
 *
 * Delays are in milliseconds.
 */
export interface MockPrefsApiConfigDelays {
  get?: number | MockPrefsApiConfigDelaysRange
  update?: number | MockPrefsApiConfigDelaysRange
  delete?: number | MockPrefsApiConfigDelaysRange
}

export class MockPrefsApiConfig {
  private _delays: MockPrefsApiConfigDelays

  constructor(private readonly delays?: MockPrefsApiConfigDelays) {
    this._delays = { ...(delays ?? {}) }
  }

  public getDelay(
    delayType: keyof MockPrefsApiConfigDelays,
  ): number | MockPrefsApiConfigDelaysRange {
    return this._delays[delayType] ?? 0
  }

  public setDelay(
    delayType: keyof MockPrefsApiConfigDelays,
    value: number | MockPrefsApiConfigDelaysRange,
  ): void {
    this._delays[delayType] = value
  }
}

const MOCK_PREFS_API_CONFIG = new InjectionToken<MockPrefsApiConfig>(
  'MOCK_PREFS_API_CONFIG',
)

const MOCK_PREFS_API_INIT_VALUE = new InjectionToken<{ [key: string]: string }>(
  'MOCK_PREFS_API_INIT_VALUE',
)

export interface MockPrefsApiActions {
  get?: any
  update?: any
  delete?: any
}

const MOCK_PREFS_ACTIONS = new InjectionToken<MockPrefsApiActions>(
  'MOCK_PREFS_ACTIONS',
)

@Injectable()
export class MockPrefsApiService {
  private readonly _config = inject(MOCK_PREFS_API_CONFIG)
  private readonly _initValue = inject(MOCK_PREFS_API_INIT_VALUE)
  private readonly _actions = inject(MOCK_PREFS_ACTIONS, { optional: true })

  private readonly _storage = new LocalStorageMemory()

  constructor() {
    if (this._initValue) {
      for (const key of Object.keys(this._initValue)) {
        this._storage.setItem(key, this._initValue[key])
      }
    }
  }

  /**
   * Gets preference.
   */
  public get(name: string): Observable<string> {
    this._actions?.get?.(name)
    console.log('[MockPrefsApiService] get', name)
    const dValue = this._config.getDelay('get')
    let d = 0
    if (typeof dValue === 'object') {
      const dMin = dValue.min ?? 0
      const dMax = dValue.max ?? dMin
      d = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin
    }
    const value = this._storage.getItem(name) || '{}'
    return of(value).pipe(delay(d))
  }

  /**
   * Update preference.
   */
  public update(name: string, value: string): Observable<string> {
    this._actions?.update?.(name, value)
    const dValue = this._config.getDelay('update')
    let d = 0
    if (typeof dValue === 'object') {
      const dMin = dValue.min ?? 0
      const dMax = dValue.max ?? dMin
      d = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin
    }
    this._storage.setItem(name, value)
    return of(value).pipe(delay(d))
  }

  /**
   * Delete preference.
   */
  public delete(name: string): Observable<boolean> {
    this._actions?.delete?.(name)
    const dValue = this._config.getDelay('delete')
    let d = 0
    if (typeof dValue === 'object') {
      const dMin = dValue.min ?? 0
      const dMax = dValue.max ?? dMin
      d = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin
    }
    this._storage.removeItem(name)
    return of(true).pipe(delay(d))
  }
}

export function provideMockPrefsApiService(
  config?: MockPrefsApiConfig | MockPrefsApiConfigDelays,
  initValue?: { [key: string]: string },
  actions?: MockPrefsApiActions,
): Provider[] {
  let _config: MockPrefsApiConfig | MockPrefsApiConfigDelays | undefined =
    config
  if (config && !(config instanceof MockPrefsApiConfig)) {
    _config = new MockPrefsApiConfig(config)
  } else if (!config) {
    _config = new MockPrefsApiConfig()
  }

  return [
    {
      provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
      useClass: MockPrefsApiService,
    },
    {
      provide: MOCK_PREFS_API_CONFIG,
      useValue: _config,
    },
    {
      provide: MOCK_PREFS_API_INIT_VALUE,
      useValue: initValue || {},
    },
    {
      provide: MOCK_PREFS_ACTIONS,
      useValue: actions,
    },
  ]
}
