/* eslint-disable no-bitwise */
/**
 * Builds ESRI Shapefile archives in memory for tests, so specs can exercise
 * the real `shpjs` instead of mocking it.
 *
 * Deliberately minimal, and only as correct as the parsers we feed it need:
 *
 * - No `.shx` — `parseShp` reads only the `.shp`, and shpjs's unzip step
 *   discards `.shx` members before parsing anyway.
 * - Zip entries are STORED, never deflated, because `but-unzip` reads stored
 *   entries directly and never verifies a CRC.
 * - Polygons are single-ring. shpjs converts a one-part polygon record without
 *   consulting ring winding, so fixture ring order does not matter.
 *
 * Every value a caller passes should be invented. No customer data belongs in
 * this repository.
 */

/** A closed ring of `[x, y]` (lon/lat) pairs. */
export type FixtureRing = [number, number][]

export interface ShapefileMember {
  /**
   * Member path inside the archive, without extension — `boundaries/Field1`
   * produces `boundaries/Field1.shp` and `boundaries/Field1.dbf`. shpjs
   * reports this verbatim as the layer's `fileName`.
   */
  name: string
  /** One ring per feature. */
  polygons: FixtureRing[]
  /** One record per feature, in the same order. Omit for a member with no `.dbf`. */
  properties?: Record<string, string | number>[]
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(bytes: Uint8Array): number {
  let c = -1
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff]
  }
  return (c ^ -1) >>> 0
}

/** Narrows a `Uint8Array` to the exact `ArrayBuffer` it covers. */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

function writeShp(polygons: FixtureRing[]): Uint8Array {
  // Record content: shape type (4) + bbox (32) + numParts (4) + numPoints (4)
  // + one part index (4) + 16 bytes per point.
  const contentLength = (ring: FixtureRing) => 48 + 16 * ring.length

  let size = 100
  for (const ring of polygons) {
    size += 8 + contentLength(ring)
  }

  const buffer = new ArrayBuffer(size)
  const view = new DataView(buffer)

  const points = polygons.flat()
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])

  // The file header's multi-byte fields are big-endian except version, shape
  // type and the bounding box, which are little-endian. That is the format,
  // not a mistake.
  view.setInt32(0, 9994)
  view.setInt32(24, size >> 1) // length, in 16-bit words
  view.setInt32(28, 1000, true) // version
  view.setInt32(32, 5, true) // shape type: Polygon
  view.setFloat64(36, Math.min(...xs), true)
  view.setFloat64(44, Math.min(...ys), true)
  view.setFloat64(52, Math.max(...xs), true)
  view.setFloat64(60, Math.max(...ys), true)

  let offset = 100
  polygons.forEach((ring, index) => {
    const content = contentLength(ring)
    view.setInt32(offset, index + 1) // record number, 1-based, big-endian
    view.setInt32(offset + 4, content >> 1) // content length in words, big-endian

    const at = offset + 8
    const rxs = ring.map((p) => p[0])
    const rys = ring.map((p) => p[1])
    view.setInt32(at, 5, true)
    view.setFloat64(at + 4, Math.min(...rxs), true)
    view.setFloat64(at + 12, Math.min(...rys), true)
    view.setFloat64(at + 20, Math.max(...rxs), true)
    view.setFloat64(at + 28, Math.max(...rys), true)
    view.setInt32(at + 36, 1, true) // numParts
    view.setInt32(at + 40, ring.length, true) // numPoints
    view.setInt32(at + 44, 0, true) // parts[0]

    let point = at + 48
    for (const [x, y] of ring) {
      view.setFloat64(point, x, true)
      view.setFloat64(point + 8, y, true)
      point += 16
    }

    offset += 8 + content
  })

  return new Uint8Array(buffer)
}

function writeDbf(records: Record<string, string | number>[]): Uint8Array {
  const fields = Object.keys(records[0] ?? {}).map((name) => {
    const values = records.map((record) => record[name])
    const numeric = values.every((value) => typeof value === 'number')
    const len = Math.max(
      1,
      ...values.map((value) => String(value).length),
      numeric ? 1 : name.length,
    )
    return { name, type: numeric ? 'N' : 'C', len: Math.min(len, 254) }
  })

  const recordLength = 1 + fields.reduce((total, f) => total + f.len, 0)
  // 32-byte header + a 32-byte descriptor per field + the 0x0D terminator.
  // parsedbf reads the first field at 32 * (fields + 1) + 2, which is this
  // offset plus the record's one-byte deletion flag. Adding any padding here
  // shifts every field by one byte and silently corrupts every value.
  const headerLength = 32 * (fields.length + 1) + 1
  const size = headerLength + recordLength * records.length + 1

  const bytes = new Uint8Array(size)
  const view = new DataView(bytes.buffer)

  bytes[0] = 0x03 // dBase III, no memo
  bytes[1] = 26 // year - 1900
  bytes[2] = 9
  bytes[3] = 15
  view.setUint32(4, records.length, true)
  view.setUint16(8, headerLength, true)
  view.setUint16(10, recordLength, true)

  fields.forEach((field, index) => {
    const at = 32 + index * 32
    const name = field.name.slice(0, 10)
    for (let c = 0; c < name.length; c++) {
      bytes[at + c] = name.charCodeAt(c)
    }
    bytes[at + 11] = field.type.charCodeAt(0)
    bytes[at + 16] = field.len
    bytes[at + 17] = 0 // decimal count
  })

  bytes[32 + fields.length * 32] = 0x0d // field descriptor terminator

  let offset = headerLength
  for (const record of records) {
    bytes[offset] = 0x20 // space: this record is not deleted
    let at = offset + 1
    for (const field of fields) {
      const raw = String(record[field.name] ?? '').slice(0, field.len)
      const text =
        field.type === 'N' ? raw.padStart(field.len) : raw.padEnd(field.len)
      for (let c = 0; c < field.len; c++) {
        bytes[at + c] = text.charCodeAt(c)
      }
      at += field.len
    }
    offset += recordLength
  }

  bytes[size - 1] = 0x1a // EOF
  return bytes
}

interface ZipEntry {
  name: string
  data: Uint8Array
}

function writeZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const data = entry.data
    const crc = crc32(data)

    const local = new Uint8Array(30 + name.length + data.length)
    const localView = new DataView(local.buffer)
    localView.setUint32(0, 0x04034b50, true)
    localView.setUint16(4, 20, true) // version needed
    localView.setUint16(8, 0, true) // compression method: stored
    localView.setUint32(14, crc, true)
    localView.setUint32(18, data.length, true) // compressed size
    localView.setUint32(22, data.length, true) // uncompressed size
    localView.setUint16(26, name.length, true)
    local.set(name, 30)
    local.set(data, 30 + name.length)
    locals.push(local)

    const central = new Uint8Array(46 + name.length)
    const centralView = new DataView(central.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true) // version made by
    centralView.setUint16(6, 20, true) // version needed
    centralView.setUint16(10, 0, true) // compression method: stored
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, data.length, true)
    centralView.setUint32(24, data.length, true)
    centralView.setUint16(28, name.length, true)
    centralView.setUint32(42, offset, true) // local header offset
    central.set(name, 46)
    centrals.push(central)

    offset += local.length
  }

  const centralSize = centrals.reduce((total, c) => total + c.length, 0)
  const out = new Uint8Array(offset + centralSize + 22)

  let at = 0
  for (const local of locals) {
    out.set(local, at)
    at += local.length
  }
  const centralStart = at
  for (const central of centrals) {
    out.set(central, at)
    at += central.length
  }

  const endView = new DataView(out.buffer, at)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(8, entries.length, true) // entries on this disk
  endView.setUint16(10, entries.length, true) // entries in total
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, centralStart, true)

  return out
}

/**
 * Builds a zip archive holding one `.shp` (and `.dbf`, when properties are
 * given) per member. Pass no members to build an archive shpjs rejects with
 * `no layers founds`.
 */
export function shapefileZip(members: ShapefileMember[]): Uint8Array {
  const entries: ZipEntry[] = []
  for (const member of members) {
    entries.push({
      name: `${member.name}.shp`,
      data: writeShp(member.polygons),
    })
    if (member.properties && member.properties.length > 0) {
      entries.push({
        name: `${member.name}.dbf`,
        data: writeDbf(member.properties),
      })
    }
  }
  return writeZip(entries)
}
