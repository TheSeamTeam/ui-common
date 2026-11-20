import { Polygon } from 'geojson'

import { polygonContains } from './polygon-contains'
import { polygonLabelPoint } from './polygon-label-point'

/** A closed ring from `[x, y]` pairs, repeating the first point at the end. */
const ring = (points: [number, number][]): [number, number][] => [
  ...points,
  points[0],
]

/**
 * Whether the polygon's label point lands inside the polygon itself, tested
 * by containing a degenerate near-zero-area square around that point.
 */
const labelPointIsInside = (polygon: Polygon): boolean => {
  const point = polygonLabelPoint(polygon)
  if (!point) {
    throw new Error('expected a label point')
  }
  const [x, y] = point
  const e = 1e-9
  return polygonContains(polygon, {
    type: 'Polygon',
    coordinates: [
      ring([
        [x - e, y - e],
        [x + e, y - e],
        [x + e, y + e],
        [x - e, y + e],
      ]),
    ],
  })
}

const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    ring([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]),
  ],
}

/**
 * A right triangle. Its bounding-box centre `[5, 5]` sits exactly on the
 * hypotenuse — the bug this helper exists to fix.
 */
const triangle: Polygon = {
  type: 'Polygon',
  coordinates: [
    ring([
      [0, 0],
      [10, 0],
      [0, 10],
    ]),
  ],
}

/**
 * A crescent: a wide block with a bite taken out of the middle of its top
 * edge, deep enough that the bounding-box centre lands in the bite.
 */
const crescent: Polygon = {
  type: 'Polygon',
  coordinates: [
    ring([
      [0, 0],
      [10, 0],
      [10, 10],
      [7, 10],
      [7, 2],
      [3, 2],
      [3, 10],
      [0, 10],
    ]),
  ],
}

/** A square with a large hole punched through its centre. */
const squareWithHole: Polygon = {
  type: 'Polygon',
  coordinates: [
    ring([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]),
    ring([
      [2, 2],
      [2, 8],
      [8, 8],
      [8, 2],
    ]),
  ],
}

describe('polygonLabelPoint', () => {
  it('returns the centre of a square', () => {
    const point = polygonLabelPoint(square)
    expect(point?.[0]).toBeCloseTo(5, 1)
    expect(point?.[1]).toBeCloseTo(5, 1)
  })

  it('places a triangle label inside the triangle, not on the hypotenuse', () => {
    expect(labelPointIsInside(triangle)).toBe(true)
  })

  it('places a crescent label inside the crescent, not in the bite', () => {
    expect(labelPointIsInside(crescent)).toBe(true)
  })

  it('keeps the label out of a hole', () => {
    expect(labelPointIsInside(squareWithHole)).toBe(true)
  })

  it('scales precision to the polygon, so tiny lat/lng polygons still resolve', () => {
    const tiny: Polygon = {
      type: 'Polygon',
      coordinates: [
        ring([
          [-93.6, 41.6],
          [-93.5999, 41.6],
          [-93.5999, 41.60005],
          [-93.6, 41.60005],
        ]),
      ],
    }
    const point = polygonLabelPoint(tiny)
    expect(point?.[0]).toBeCloseTo(-93.59995, 5)
    expect(point?.[1]).toBeCloseTo(41.600025, 5)
  })

  it('returns undefined for a polygon with no coordinates', () => {
    expect(
      polygonLabelPoint({ type: 'Polygon', coordinates: [] }),
    ).toBeUndefined()
  })
})
