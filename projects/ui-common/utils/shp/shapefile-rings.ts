import { MultiPolygon, Polygon, Position } from 'geojson'

/** A closed ring of `[x, y]` (lon, lat) positions. */
export type ShpRing = [number, number][]

/** Shoelace signed area. Positive means counter-clockwise. */
export function ringSignedArea(ring: ShpRing): number {
  let sum = 0
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return sum / 2
}

function toRing(positions: Position[], featureIndex: number): ShpRing {
  const ring: ShpRing = positions.map((p) => {
    const x = p[0]
    const y = p[1]
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Feature ${featureIndex} has a non-finite coordinate.`)
    }
    return [x, y]
  })
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first && (first[0] !== last[0] || first[1] !== last[1])) {
    ring.push([first[0], first[1]])
  }
  if (ring.length < 4 || ringSignedArea(ring) === 0) {
    throw new Error(`Feature ${featureIndex} has a ring with no area.`)
  }
  return ring
}

/**
 * Returns every ring of the feature in shapefile write order, closed and
 * wound (outer rings clockwise, holes counter-clockwise). Never mutates the
 * input.
 */
export function toShapefileRings(
  geometry: Polygon | MultiPolygon,
  featureIndex: number,
): ShpRing[] {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  if (polygons.length === 0 || polygons.some((p) => p.length === 0)) {
    throw new Error(`Feature ${featureIndex} has no rings.`)
  }
  const result: ShpRing[] = []
  for (const polygon of polygons) {
    polygon.forEach((positions, i) => {
      const ring = toRing(positions, featureIndex)
      const area = ringSignedArea(ring)
      if (i === 0 ? area > 0 : area < 0) {
        ring.reverse()
      }
      result.push(ring)
    })
  }
  return result
}
