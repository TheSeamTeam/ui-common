import { Polygon } from 'geojson'

import booleanContains from '@turf/boolean-contains'
import { polygon as turfPolygon } from '@turf/helpers'

/**
 * Whether `outer` fully contains `inner`, using turf's boolean-contains on the
 * GeoJSON geometries directly (no Google Maps dependency).
 */
export function polygonContains(outer: Polygon, inner: Polygon): boolean {
  return booleanContains(
    turfPolygon(outer.coordinates),
    turfPolygon(inner.coordinates),
  )
}
