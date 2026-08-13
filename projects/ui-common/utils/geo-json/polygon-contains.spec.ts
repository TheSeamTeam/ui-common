import { Polygon } from 'geojson'

import { polygonContains } from './polygon-contains'

const outer: Polygon = {
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

describe('polygonContains', () => {
  it('returns true when inner is fully inside outer', () => {
    const inner: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [2, 4],
          [4, 4],
          [4, 2],
          [2, 2],
        ],
      ],
    }
    expect(polygonContains(outer, inner)).toBe(true)
  })

  it('returns false when inner is outside outer', () => {
    const inner: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [20, 20],
          [20, 22],
          [22, 22],
          [22, 20],
          [20, 20],
        ],
      ],
    }
    expect(polygonContains(outer, inner)).toBe(false)
  })

  it('returns true when inner touches the outer boundary edge (boundary-inclusive, not strict interior)', () => {
    // Shares the entire left edge (x=0) with outer's boundary. Turf's
    // booleanContains checks each of inner's points with
    // booleanPointInPolygon using the default `ignoreBoundary: false`, so
    // points lying exactly on outer's boundary still count as "contained".
    // This pins down that behavior: touching the boundary does NOT make an
    // otherwise-inside polygon fail containment.
    const inner: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 2],
          [0, 4],
          [2, 4],
          [2, 2],
          [0, 2],
        ],
      ],
    }
    expect(polygonContains(outer, inner)).toBe(true)
  })
})
