import { Polygon } from '@turf/helpers'
import {
  Feature,
  FeatureCollection,
  MultiPolygon,
} from 'geojson'

/**
 *
 * NOTE: MultiPolygons in a GeometryCollection will not be split.
 */
export function splitMultiPolygons(featureCollection: FeatureCollection): void {
  for (let i = 0; i < featureCollection.features.length; i++) {
    if (featureCollection.features[i]) {
      const geometry = featureCollection.features[i].geometry
      if (geometry.type === 'MultiPolygon') {
        const features = splitMultPolygon(geometry).map(p => ({
          type: 'Feature',
          geometry: p,
          properties: { },
        } as Feature))
        featureCollection.features.splice(i, 1, ...features)
        i += Math.max(features.length - 1, 0)
      }
    }
  }
}

function splitMultPolygon(multiPolygon: MultiPolygon): Polygon[] {
  return multiPolygon.coordinates.map(c => ({
    type: 'Polygon',
    coordinates: c,
  }))
}
