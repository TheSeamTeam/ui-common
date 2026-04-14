import { InjectionToken, Provider } from '@angular/core'

/** Configuration for `TheSeamStatesCountiesMapComponent`. */
export interface TheSeamStatesCountiesMapConfig {
  /**
   * URL to the TopoJSON topology file.
   *
   * Defaults to `/assets/geoData/us.json` when the token is not provided.
   * The file is not shipped with the library — each consuming app must
   * place a compatible topology at this path or provide a different URL
   * via `provideStatesCountiesMap({ topologyUrl })`.
   */
  readonly topologyUrl?: string
}

/** Default URL used when no config is provided. */
export const THE_SEAM_STATES_COUNTIES_MAP_DEFAULT_URL =
  '/assets/geoData/us.json'

/** DI token for `TheSeamStatesCountiesMapConfig`. */
export const THE_SEAM_STATES_COUNTIES_MAP_CONFIG =
  new InjectionToken<TheSeamStatesCountiesMapConfig>(
    'THE_SEAM_STATES_COUNTIES_MAP_CONFIG',
  )

/**
 * Register configuration for the states-counties map.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStatesCountiesMap({ topologyUrl: '/static/us.json' }),
 *   ],
 * })
 * ```
 */
export function provideStatesCountiesMap(
  config: TheSeamStatesCountiesMapConfig,
): Provider {
  return { provide: THE_SEAM_STATES_COUNTIES_MAP_CONFIG, useValue: config }
}
