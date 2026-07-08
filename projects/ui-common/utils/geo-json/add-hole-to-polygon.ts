import { Polygon, Position } from 'geojson'

/**
 * Whether a ring is wound clockwise, via the shoelace signed-area sign.
 * Sum of (x2 - x1) * (y2 + y1) is positive for clockwise rings in standard
 * (x = lng, y = lat) orientation.
 */
export function ringIsClockwise(ring: Position[]): boolean {
  let sum = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    sum += (x2 - x1) * (y2 + y1)
  }
  return sum > 0
}

/** Return `ring` wound opposite to `reference`, reversing a copy if needed. */
function ringWoundOpposite(
  reference: Position[],
  ring: Position[],
): Position[] {
  if (ringIsClockwise(reference) === ringIsClockwise(ring)) {
    return [...ring].reverse()
  }
  return [...ring]
}

/**
 * Append the outer ring of `hole` to `exterior` as an interior ring (a
 * cutout), wound opposite the exterior ring so it renders as a hole. Returns a
 * new Polygon; inputs are not mutated.
 */
export function addHoleToPolygon(exterior: Polygon, hole: Polygon): Polygon {
  const exteriorRing = exterior.coordinates[0]
  const holeRing = ringWoundOpposite(exteriorRing, hole.coordinates[0])
  return {
    type: 'Polygon',
    coordinates: [...exterior.coordinates, holeRing],
  }
}
