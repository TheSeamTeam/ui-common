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
})
