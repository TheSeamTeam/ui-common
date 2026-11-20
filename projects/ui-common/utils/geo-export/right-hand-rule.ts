import type { Feature, FeatureCollection, Position } from 'geojson'

import { ringSignedArea } from '../shp/shapefile-rings'

/**
 * Returns a copy of the collection whose Polygon and MultiPolygon rings follow
 * the RFC 7946 right-hand rule (section 3.1.6): outer rings counter-clockwise,
 * holes clockwise.
 *
 * The RFC requires writers to follow the rule, while readers should accept
 * either direction. Google Maps keeps whatever direction a ring was drawn or
 * loaded in, so map output can be backwards.
 *
 * Only ring direction changes. Positions keep every value they had, including
 * any altitude, and rings are neither closed nor validated. Other geometry
 * types, including GeometryCollection, and all properties are left as given.
 * Never mutates the input.
 */
export function rewindToRightHandRule(
  collection: FeatureCollection,
): FeatureCollection {
  return { ...collection, features: collection.features.map(rewindFeature) }
}

function rewindFeature(feature: Feature): Feature {
  const geometry = feature.geometry
  if (geometry?.type === 'Polygon') {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: rewindPolygon(geometry.coordinates),
      },
    }
  }
  if (geometry?.type === 'MultiPolygon') {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.map(rewindPolygon),
      },
    }
  }
  return feature
}

function rewindPolygon(rings: Position[][]): Position[][] {
  return rings.map((ring, i) => {
    const area = ringSignedArea(ring)
    const backwards = i === 0 ? area < 0 : area > 0
    return backwards ? [...ring].reverse() : ring
  })
}
