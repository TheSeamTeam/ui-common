import { FeatureCollection, Geometry } from 'geojson'

/**
 * Returns true if the GeoJSON is only specifies geometries.
 */
export function isOnlyGeometryTypes(featureCollection: FeatureCollection, types: Geometry['type'][]): boolean {
  if (types.length === 0) {
    if (featureCollection.features.length > 0) {
      // If no types are specified then there can't be any specified types found.
      return false
    } else {
      // If no types are specified and there are no features then there is
      // nothing to say a specified type isn't found.
      return true
    }
  }

  for (const f of featureCollection.features) {
    if (types.indexOf(f.geometry.type) === -1) {
      return false
    }
  }

  return true
}
