import { Polygon, Position } from 'geojson'

import { addHoleToPolygon, ringIsClockwise } from './add-hole-to-polygon'

// Counter-clockwise exterior square (0,0)->(10,0)->(10,10)->(0,10).
const exterior: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  ],
}

describe('ringIsClockwise', () => {
  it('detects a clockwise ring', () => {
    const cw: Position[] = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ]
    expect(ringIsClockwise(cw)).toBe(true)
  })

  it('detects a counter-clockwise ring', () => {
    expect(ringIsClockwise(exterior.coordinates[0])).toBe(false)
  })
})

describe('addHoleToPolygon', () => {
  it('appends the hole as a second ring', () => {
    const hole: Polygon = {
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
    const result = addHoleToPolygon(exterior, hole)
    expect(result.coordinates).toHaveLength(2)
    expect(result.coordinates[0]).toEqual(exterior.coordinates[0])
  })

  it('winds the hole ring opposite the exterior ring', () => {
    // Hole drawn with the SAME (CCW) winding as the exterior.
    const holeSameWinding: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [2, 2],
          [4, 2],
          [4, 4],
          [2, 4],
          [2, 2],
        ],
      ],
    }
    expect(ringIsClockwise(exterior.coordinates[0])).toBe(false)
    expect(ringIsClockwise(holeSameWinding.coordinates[0])).toBe(false)

    const result = addHoleToPolygon(exterior, holeSameWinding)
    // The appended hole ring must be reversed to the opposite winding.
    expect(ringIsClockwise(result.coordinates[1])).toBe(true)
  })

  it('leaves an already-opposite hole ring unchanged', () => {
    const holeOpposite: Polygon = {
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
    expect(ringIsClockwise(holeOpposite.coordinates[0])).toBe(true)
    const result = addHoleToPolygon(exterior, holeOpposite)
    expect(result.coordinates[1]).toEqual(holeOpposite.coordinates[0])
  })

  it('does not mutate the input exterior polygon', () => {
    const hole: Polygon = {
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
    addHoleToPolygon(exterior, hole)
    expect(exterior.coordinates).toHaveLength(1)
  })
})
