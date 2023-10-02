import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

/**
 * Close all polygons in the GeoJSON.
 *
 * Google Maps requires that polygons be closed, but not all libraries have that
 * requirement. This may add redundent points to the GeoJSON, but it will ensure
 * that the GeoJSON is valid for Google Maps.
 */
export function closePolygons(geoJson: FeatureCollection | Feature | Polygon | MultiPolygon) {
  if (geoJson.type === 'FeatureCollection') {
    for (const f of geoJson.features) {
      closePolygonsFeature(f)
    }
  } else if (geoJson.type === 'Feature') {
    closePolygonsFeature(geoJson)
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
  for (const c of polygon.coordinates) {
    c.push(c[0])
  }
}

function closeMultiPolygon(multiPolygon: MultiPolygon): void {
  for (const p of multiPolygon.coordinates) {
    for (const c of p) {
      c.push(c[0])
    }
  }
}
