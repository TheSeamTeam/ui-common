import { Polygon, Position } from 'geojson'

import { polygonViolatesMinMax } from './polygon-violates-min-max'

/** Count distinct vertices in a ring, ignoring an explicit closing point. */
function distinctVertexCount(ring: Position[]): number {
  if (ring.length === 0) {
    return 0
  }
  const first = ring[0]
  const last = ring[ring.length - 1]
  const isClosed =
    ring.length > 1 && first[0] === last[0] && first[1] === last[1]
  return isClosed ? ring.length - 1 : ring.length
}

/**
 * Whether a polygon's outer ring has at least `min` distinct vertices.
 * Ring closure (a repeated first/last point) does not count toward the total,
 * so this behaves the same for closed and unclosed rings.
 */
export function polygonHasMinDistinctVertices(
  polygon: Polygon,
  min: number = 3,
): boolean {
  const outer = polygon.coordinates[0] ?? []
  return !polygonViolatesMinMax(distinctVertexCount(outer), min, undefined)
}
