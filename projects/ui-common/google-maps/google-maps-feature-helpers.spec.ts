import { Feature, MultiPolygon, Polygon } from 'geojson'

import {
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from './testing/fake-google-maps'
import {
  dataMultiPolygonFromGeoJson,
  dataPolygonFromGeoJson,
  geoJsonFeatureFromDataFeature,
  geoJsonPolygonFromDataFeature,
  getFeatureBounds,
  polygonsFromDataFeature,
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

const twoSquares: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0, 0],
        [0, 10],
        [10, 10],
        [10, 0],
        [0, 0],
      ],
    ],
    [
      [
        [20, 20],
        [20, 30],
        [30, 30],
        [30, 20],
        [20, 20],
      ],
    ],
  ],
}

describe('MultiPolygon helpers', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('returns every part of a MultiPolygon', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataMultiPolygonFromGeoJson(twoSquares),
    })
    const parts = polygonsFromDataFeature(feature)
    expect(parts).toHaveLength(2)
    expect(parts[0].coordinates).toEqual(twoSquares.coordinates[0])
    expect(parts[1].coordinates).toEqual(twoSquares.coordinates[1])
  })

  it('returns the single part of a Polygon feature', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
    })
    expect(polygonsFromDataFeature(feature)).toEqual([square])
  })

  it('reads a MultiPolygon feature as a GeoJSON Feature with properties', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataMultiPolygonFromGeoJson(twoSquares),
      properties: { FIELD_NAME: 'North Field' },
    })
    const result = geoJsonFeatureFromDataFeature(feature)
    expect(result?.geometry).toEqual(twoSquares)
    expect(result?.properties).toEqual({ FIELD_NAME: 'North Field' })
  })

  it('omits properties the caller excludes', () => {
    const feature = new google.maps.Data.Feature({
      geometry: dataPolygonFromGeoJson(square),
      properties: { keep: 1, __app__isSelected: true },
    })
    const result = geoJsonFeatureFromDataFeature(feature, (name) =>
      name.startsWith('__app__'),
    )
    expect(result?.properties).toEqual({ keep: 1 })
  })

  it('returns undefined for a geometry that is neither Polygon nor MultiPolygon', () => {
    const feature = new google.maps.Data.Feature({ geometry: null })
    expect(geoJsonFeatureFromDataFeature(feature)).toBeUndefined()
    expect(polygonsFromDataFeature(feature)).toEqual([])
  })
})
