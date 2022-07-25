import {
  Feature,
  FeatureCollection,
  MultiPolygon,
} from 'geojson'

/**
 * Merge Polygon and MultiPolygon geometries into a single MultiPolygon. Any
 * properties, other than 'coordinates', of the Polygons and MultiPolygons will
 * be lost.
 *
 * NOTE: Polygons and MultPolygons in a GeometryCollection will not be merged.
 */
export function mergePolygons(featureCollection: FeatureCollection): void {
  const multiPolygon: MultiPolygon = {
    type: 'MultiPolygon',
    coordinates: [],
  }

  for (let i = 0; i < featureCollection.features.length; i++) {
    const f = featureCollection.features[i]
    if (f.geometry.type === 'Polygon') {
      multiPolygon.coordinates.push(f.geometry.coordinates)
      featureCollection.features.splice(i, 1)
      i--
    } else if (f.geometry.type === 'MultiPolygon') {
      multiPolygon.coordinates.push(...f.geometry.coordinates)
      featureCollection.features.splice(i, 1)
      i--
    }
  }

  if (multiPolygon.coordinates.length > 0) {
    const feature: Feature = {
      type: 'Feature',
      geometry: multiPolygon,
      properties: { },
    }
    featureCollection.features.push(feature)
  }
}
