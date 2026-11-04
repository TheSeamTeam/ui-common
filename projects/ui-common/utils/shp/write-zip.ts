/* eslint-disable no-bitwise */

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

export function crc32(bytes: Uint8Array): number {
  let c = -1
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff]
  }
  return (c ^ -1) >>> 0
}

export interface ZipEntry {
  name: string
  data: Uint8Array
}

/** Builds a zip archive with every entry STORED (not deflated). */
export function writeStoredZip(entries: ZipEntry[]): Uint8Array {
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
