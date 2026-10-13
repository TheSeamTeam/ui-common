import { Polygon } from 'geojson'

import { polygonHasMinDistinctVertices } from './polygon-has-min-distinct-vertices'

function polygon(outer: number[][]): Polygon {
  return { type: 'Polygon', coordinates: [outer] }
}

describe('polygonHasMinDistinctVertices', () => {
  it('accepts a closed triangle (3 distinct vertices)', () => {
    const tri = polygon([
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 0],
    ])
    expect(polygonHasMinDistinctVertices(tri)).toBe(true)
  })

  it('accepts an unclosed triangle (3 distinct vertices)', () => {
    const tri = polygon([
      [0, 0],
      [0, 1],
      [1, 0],
    ])
    expect(polygonHasMinDistinctVertices(tri)).toBe(true)
  })

  it('rejects a closed ring with only 2 distinct vertices', () => {
    const degenerate = polygon([
      [0, 0],
      [0, 1],
      [0, 0],
    ])
    expect(polygonHasMinDistinctVertices(degenerate)).toBe(false)
  })

  it('rejects an empty polygon', () => {
    expect(
      polygonHasMinDistinctVertices({ type: 'Polygon', coordinates: [] }),
    ).toBe(false)
  })

  it('honors a custom minimum', () => {
    const square = polygon([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ])
    expect(polygonHasMinDistinctVertices(square, 5)).toBe(false)
    expect(polygonHasMinDistinctVertices(square, 4)).toBe(true)
  })
})
