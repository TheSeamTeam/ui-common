import { Polygon } from 'geojson'

import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from './testing/fake-google-maps'
import {
  dataPolygonFromGeoJson,
  geoJsonPolygonFromDataFeature,
  getFeatureBounds,
} from './google-maps-feature-helpers'

const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ],
  ],
}

describe('google-maps-feature-helpers', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('drops the explicit closing point when building a Data.Polygon', () => {
    // Direction matters, and the two rules look contradictory until you notice
    // which side of the boundary each applies to. GeoJSON rings are explicitly
    // closed (RFC 7946 3.1.6), which is what `closePolygons` guarantees on the
    // way OUT and what `data.addGeoJson()` expects. But a
    // `google.maps.Data.Polygon` is built from LinearRings, which are
    // IMPLICITLY closed — repeating the first point there creates a real
    // duplicate vertex that edits independently and serializes as a double
    // closing point. So a 5-position closed ring becomes 4 path points.
    const polygon = dataPolygonFromGeoJson(square)
    expect(polygon.getArray()[0].getArray()).toHaveLength(4)
  })

  it('round-trips a Polygon back to closed GeoJSON', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
    })
    expect(geoJsonPolygonFromDataFeature(feature)).toEqual(square)
  })

  it('computes bounds covering every vertex', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
    })
    const bounds = getFeatureBounds(feature)
    expect(bounds.getCenter().lat()).toBeCloseTo(5)
    expect(bounds.getCenter().lng()).toBeCloseTo(5)
  })
})
