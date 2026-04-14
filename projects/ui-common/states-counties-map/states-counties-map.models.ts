import type { Feature, Geometry } from 'geojson'

/**
 * Payload emitted by `countyClick` / `countyHover` outputs.
 *
 * `id` is the FIPS county code as a string (e.g., `"01001"`), matching the
 * format consumers pass to `selectedCountyIds`. `feature` is the raw
 * GeoJSON feature produced by `topojson.feature(...)`.
 */
export interface TheSeamStatesCountiesMapCountyEvent {
  readonly id: string
  readonly feature: Feature<Geometry>
}
