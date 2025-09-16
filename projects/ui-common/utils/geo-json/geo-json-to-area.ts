import area from '@turf/area'
import { AreaUnits, convertArea } from '@turf/helpers'
import { GeoJSON, Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'

/**
 *
 */
export function geoJsonToArea(
  geoJson: GeoJSON | Feature<any, GeoJsonProperties> | FeatureCollection<any, GeoJsonProperties> | Geometry,
  units: AreaUnits = 'acres'
): number {
  const areaMSqr = area(geoJson as any)
  const acres = convertArea(areaMSqr, 'meters', units)
  return acres
}
