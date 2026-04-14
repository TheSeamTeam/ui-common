import { inject, Injectable } from '@angular/core'
import type { Topology } from 'topojson-specification'

import {
  THE_SEAM_STATES_COUNTIES_MAP_CONFIG,
  THE_SEAM_STATES_COUNTIES_MAP_DEFAULT_URL,
} from './states-counties-map-config'

/**
 * Loads and caches TopoJSON topology data for the states/counties map.
 *
 * Provided in root so that multiple component instances share a single
 * in-flight/cached request per URL.
 */
@Injectable({ providedIn: 'root' })
export class TheSeamStatesCountiesMapDataService {
  private readonly _config = inject(THE_SEAM_STATES_COUNTIES_MAP_CONFIG, {
    optional: true,
  })

  private readonly _cache = new Map<string, Promise<Topology>>()

  /**
   * Load the topology from the configured URL (or an explicit override).
   * Concurrent calls for the same URL share a single fetch promise.
   */
  load(url?: string): Promise<Topology> {
    const resolvedUrl =
      url ??
      this._config?.topologyUrl ??
      THE_SEAM_STATES_COUNTIES_MAP_DEFAULT_URL

    const existing = this._cache.get(resolvedUrl)
    if (existing) {
      return existing
    }

    const promise = fetch(resolvedUrl).then(async (res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to load topology from ${resolvedUrl}: ${res.status} ${res.statusText}`,
        )
      }
      return (await res.json()) as Topology
    })

    // Evict on rejection so a transient failure doesn't poison the cache.
    promise.catch(() => this._cache.delete(resolvedUrl))
    this._cache.set(resolvedUrl, promise)
    return promise
  }
}
