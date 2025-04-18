import area from '@turf/area'
import { convertArea, Feature, FeatureCollection, Geometry, Properties, Units } from '@turf/helpers'
import { GeoJSON } from 'geojson'

/**
 *
 */
export function geoJsonToArea(
  geoJson: GeoJSON | Feature<any, Properties> | FeatureCollection<any, Properties> | Geometry,
  units: Units = 'acres'
): number {
  const areaMSqr = area(geoJson as any)
  const acres = convertArea(areaMSqr, 'meters', units)
  return acres
}
