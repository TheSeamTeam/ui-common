import {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson'

/**
 * Close all polygons in the GeoJSON so the first and last position of every
 * ring are identical.
 *
 * Google Maps requires closed polygon rings, but not all libraries produce
 * them. This is idempotent: rings that are already closed are left unchanged.
 */
export function closePolygons(
  geoJson: FeatureCollection | Feature | Polygon | MultiPolygon,
): void {
  if (geoJson.type === 'FeatureCollection') {
    for (const f of geoJson.features) {
      closePolygonsFeature(f)
    }
  } else if (geoJson.type === 'Feature') {
    closePolygonsFeature(geoJson)
  } else if (geoJson.type === 'Polygon') {
    closePolygon(geoJson)
  } else if (geoJson.type === 'MultiPolygon') {
    closeMultiPolygon(geoJson)
  }
}

function closePolygonsFeature(feature: Feature): void {
  if (feature.geometry.type === 'Polygon') {
    closePolygon(feature.geometry)
  } else if (feature.geometry.type === 'MultiPolygon') {
    closeMultiPolygon(feature.geometry)
  }
}

function closePolygon(polygon: Polygon): void {
  for (const ring of polygon.coordinates) {
    closeRing(ring)
  }
}

function closeMultiPolygon(multiPolygon: MultiPolygon): void {
  for (const polygon of multiPolygon.coordinates) {
    for (const ring of polygon) {
      closeRing(ring)
    }
  }
}

/**
 * Appends the first position to the end of a ring only when it is not already
 * closed. Exact equality is correct here: the closing point is a copy of the
 * first point, so we compare a value against its own copy.
 */
function closeRing(ring: Position[]): void {
  if (ring.length < 1) {
    return
  }
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return
  }
  ring.push([...first])
}
