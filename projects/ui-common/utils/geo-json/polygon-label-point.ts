import { Polygon, Position } from 'geojson'

import polylabel from 'polylabel'

/**
 * How finely `polylabel` subdivides, as a fraction of the polygon's larger
 * bounding-box side. Relative rather than absolute because this library's
 * polygons are in degrees, where `polylabel`'s own default precision of `1.0`
 * is roughly 110km and would return the first candidate cell for any real
 * field.
 */
const PRECISION_RATIO = 1 / 1000

/**
 * The best point to anchor a label inside a polygon: its pole of
 * inaccessibility, the interior point furthest from any edge.
 *
 * This is deliberately not the centroid. A polygon's centroid is the centre of
 * its area, which for a concave shape — a crescent, a C, an L — can fall
 * outside the polygon entirely, putting the label off the shape it names. Nor
 * is it the centre of the bounding box, which is wrong even for a triangle:
 * the box centre of a right triangle sits exactly on the hypotenuse. The pole
 * of inaccessibility is always inside, and being the furthest point from any
 * edge it also leaves the most clear space around the text.
 *
 * Holes are honoured: rings after the first are treated as holes, so a label
 * will not be placed in one.
 *
 * Returns `undefined` for a polygon with no outer ring, which has no interior
 * to place anything in.
 */
export function polygonLabelPoint(
  polygon: Polygon,
): [number, number] | undefined {
  const rings = polygon.coordinates
  const outer = rings[0]
  if (!outer || outer.length === 0) {
    return undefined
  }

  const [x, y] = polylabel(rings.map(toXYRing), precisionFor(outer))
  return [x, y]
}

/**
 * GeoJSON positions are `number[]` and may carry an elevation; `polylabel`
 * wants exactly `[x, y]`.
 */
function toXYRing(ring: Position[]): [number, number][] {
  return ring.map(([x, y]) => [x, y])
}

function precisionFor(outer: Position[]): number {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of outer) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  const size = Math.max(maxX - minX, maxY - minY)
  // A zero-size (single point, or a vertical/horizontal sliver) polygon would
  // give a precision of 0, which `polylabel` never reaches — it would spin
  // until its queue emptied. Any positive precision terminates immediately on
  // a shape with no area.
  return size > 0 ? size * PRECISION_RATIO : 1
}
