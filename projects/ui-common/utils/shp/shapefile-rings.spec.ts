import { MultiPolygon, Polygon } from 'geojson'
import { ringSignedArea, toShapefileRings } from './shapefile-rings'

describe('shapefile-rings', () => {
  it('ringSignedArea is positive for a counter-clockwise square', () => {
    expect(
      ringSignedArea([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ]),
    ).toBe(1)
  })

  it('makes outer rings clockwise and holes counter-clockwise', () => {
    const ccwOuter = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ]
    const cwOuter = [...ccwOuter].reverse()
    const cwHole = [
      [2, 2],
      [2, 4],
      [4, 4],
      [4, 2],
      [2, 2],
    ]
    const ccwHole = [...cwHole].reverse()
    const mixed = toShapefileRings(
      { type: 'Polygon', coordinates: [ccwOuter, cwHole] },
      0,
    )
    const aligned = toShapefileRings(
      { type: 'Polygon', coordinates: [cwOuter, ccwHole] },
      0,
    )
    expect(ringSignedArea(mixed[0])).toBeLessThan(0)
    expect(ringSignedArea(mixed[1])).toBeGreaterThan(0)
    expect(aligned).toEqual(mixed)
  })

  it('orders MultiPolygon rings polygon by polygon', () => {
    const square = (o: number, s: number) => [
      [o, o],
      [o, o + s],
      [o + s, o + s],
      [o + s, o],
      [o, o],
    ]
    const geometry: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [[square(0, 10), square(2, 2)], [square(20, 5)]],
    }
    const rings = toShapefileRings(geometry, 0)
    expect(rings.length).toBe(3)
    expect(rings[2][0]).toEqual([20, 20])
    expect(ringSignedArea(rings[2])).toBeLessThan(0)
  })

  it('closes open rings', () => {
    const [ring] = toShapefileRings(
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        ],
      },
      0,
    )
    expect(ring.length).toBe(5)
    expect(ring[4]).toEqual(ring[0])
  })

  it('drops altitude', () => {
    const [ring] = toShapefileRings(
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0, 5],
            [1, 0, 5],
            [1, 1, 5],
            [0, 0, 5],
          ],
        ],
      },
      0,
    )
    expect(ring.every((p) => p.length === 2)).toBe(true)
  })

  it('throws on a ring with no area', () => {
    const make = (ring: number[][]): Polygon => ({
      type: 'Polygon',
      coordinates: [ring],
    })
    expect(() =>
      toShapefileRings(
        make([
          [0, 0],
          [1, 1],
          [0, 0],
        ]),
        3,
      ),
    ).toThrow(/Feature 3 has a ring with no area/)
    expect(() =>
      toShapefileRings(
        make([
          [0, 0],
          [1, 1],
          [2, 2],
          [0, 0],
        ]),
        3,
      ),
    ).toThrow(/Feature 3 has a ring with no area/)
  })

  it('throws when there are no rings', () => {
    expect(() =>
      toShapefileRings({ type: 'Polygon', coordinates: [] }, 2),
    ).toThrow('Feature 2 has no rings.')
    expect(() =>
      toShapefileRings({ type: 'MultiPolygon', coordinates: [] }, 2),
    ).toThrow('Feature 2 has no rings.')
  })

  it('throws on non-finite coordinates', () => {
    const ring = [
      [0, 0],
      [1, 0],
      [NaN, 1],
      [0, 0],
    ]
    expect(() =>
      toShapefileRings({ type: 'Polygon', coordinates: [ring] }, 0),
    ).toThrow()
    const inf = [
      [0, 0],
      [1, 0],
      [1, Infinity],
      [0, 0],
    ]
    expect(() =>
      toShapefileRings({ type: 'Polygon', coordinates: [inf] }, 0),
    ).toThrow()
  })

  it('does not mutate its input', () => {
    const geometry: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0, 1],
          [1, 0, 1],
          [1, 1, 1],
          [0, 1, 1],
        ],
      ],
    }
    const before = JSON.parse(JSON.stringify(geometry))
    toShapefileRings(geometry, 0)
    expect(geometry).toEqual(before)
  })
})
