import area from '@turf/area'
import { convertArea, Feature, FeatureCollection, Geometry, Properties } from '@turf/helpers'
import { GeoJSON } from 'geojson'

/**
 *
 */
export function geoJsonToArea(
  geoJson: GeoJSON | Feature<any, Properties> | FeatureCollection<any, Properties> | Geometry,
  units: 'acres'
): number {
  const area_mSqr = area(geoJson as any)
  const acres = convertArea(area_mSqr, 'meters', units)
  return acres
}
