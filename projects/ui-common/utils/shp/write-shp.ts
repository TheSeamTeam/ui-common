/* eslint-disable no-bitwise */
import { ShpRing } from './shapefile-rings'

const HEADER_BYTES = 100
const POLYGON = 5

function writeHeader(
  view: DataView,
  fileBytes: number,
  bbox: [number, number, number, number],
): void {
  // File code and length are big-endian; version, shape type and bbox are
  // little-endian. That is the format, not a mistake.
  view.setInt32(0, 9994)
  view.setInt32(24, fileBytes >> 1)
  view.setInt32(28, 1000, true)
  view.setInt32(32, POLYGON, true)
  bbox.forEach((value, i) => view.setFloat64(36 + i * 8, value, true))
}

function bboxOf(rings: ShpRing[]): [number, number, number, number] {
  let xmin = Infinity
  let ymin = Infinity
  let xmax = -Infinity
  let ymax = -Infinity
  for (const ring of rings) {
    for (const [x, y] of ring) {
      xmin = Math.min(xmin, x)
      ymin = Math.min(ymin, y)
      xmax = Math.max(xmax, x)
      ymax = Math.max(ymax, y)
    }
  }
  return [xmin, ymin, xmax, ymax]
}

/**
 * Writes one multi-part Polygon record per feature and its `.shx` index.
 * Each feature's rings must already be closed and wound for Shapefile (see
 * `toShapefileRings`). Records are numbered 1..n in order.
 */
export function writeShpAndShx(features: ShpRing[][]): {
  shp: Uint8Array
  shx: Uint8Array
} {
  const contentBytes = features.map(
    (rings) =>
      44 + 4 * rings.length + 16 * rings.reduce((n, r) => n + r.length, 0),
  )
  const shpBytes = contentBytes.reduce((n, c) => n + 8 + c, HEADER_BYTES)
  const shxBytes = HEADER_BYTES + 8 * features.length

  const shp = new DataView(new ArrayBuffer(shpBytes))
  const shx = new DataView(new ArrayBuffer(shxBytes))

  const fileBbox = bboxOf(features.flat())
  writeHeader(shp, shpBytes, fileBbox)
  writeHeader(shx, shxBytes, fileBbox)

  let offset = HEADER_BYTES
  features.forEach((rings, index) => {
    const content = contentBytes[index]
    const entry = HEADER_BYTES + index * 8
    shx.setInt32(entry, offset >> 1)
    shx.setInt32(entry + 4, content >> 1)

    shp.setInt32(offset, index + 1)
    shp.setInt32(offset + 4, content >> 1)

    const at = offset + 8
    const numPoints = rings.reduce((n, r) => n + r.length, 0)
    shp.setInt32(at, POLYGON, true)
    bboxOf(rings).forEach((value, i) =>
      shp.setFloat64(at + 4 + i * 8, value, true),
    )
    shp.setInt32(at + 36, rings.length, true)
    shp.setInt32(at + 40, numPoints, true)

    let start = 0
    let point = at + 44 + 4 * rings.length
    rings.forEach((ring, partIndex) => {
      shp.setInt32(at + 44 + 4 * partIndex, start, true)
      start += ring.length
      for (const [x, y] of ring) {
        shp.setFloat64(point, x, true)
        shp.setFloat64(point + 8, y, true)
        point += 16
      }
    })

    offset += 8 + content
  })

  return { shp: new Uint8Array(shp.buffer), shx: new Uint8Array(shx.buffer) }
}
