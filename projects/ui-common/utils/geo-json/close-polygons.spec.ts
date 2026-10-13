import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

import { closePolygons } from './close-polygons'

describe('closePolygons', () => {
  it('closes an open Polygon ring', () => {
    const geo: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 0],
        ],
      ],
    }
    closePolygons(geo)
    expect(geo.coordinates[0]).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('does not double-close an already-closed ring (idempotent)', () => {
    const geo: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 0],
          [0, 0],
        ],
      ],
    }
    closePolygons(geo)
    closePolygons(geo)
    expect(geo.coordinates[0]).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('closes a bare MultiPolygon', () => {
    const geo: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [0, 1],
            [1, 0],
          ],
        ],
      ],
    }
    closePolygons(geo)
    expect(geo.coordinates[0][0]).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('closes polygons inside a Feature', () => {
    const feature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 0],
          ],
        ],
      },
    }
    closePolygons(feature)
    expect((feature.geometry as Polygon).coordinates[0]).toHaveLength(4)
  })

  it('does not double-close an already-closed ring in a Feature (idempotent)', () => {
    const feature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 0],
            [0, 0],
          ],
        ],
      },
    }
    closePolygons(feature)
    closePolygons(feature)
    expect((feature.geometry as Polygon).coordinates[0]).toHaveLength(4)
  })

  it('does not double-close an already-closed ring in a FeatureCollection (idempotent)', () => {
    const fc: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [0, 1],
                [1, 0],
                [0, 0],
              ],
            ],
          },
        },
      ],
    }
    closePolygons(fc)
    closePolygons(fc)
    expect((fc.features[0].geometry as Polygon).coordinates[0]).toHaveLength(4)
  })
})
