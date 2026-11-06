/* eslint-disable no-bitwise */

import { crc32, writeStoredZip } from './write-zip'

describe('write-zip', () => {
  it('crc32 matches the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926)
  })

  it('writeStoredZip lays out a stored archive', () => {
    const zip = writeStoredZip([
      { name: 'a.txt', data: Uint8Array.of(1, 2, 3) },
      { name: 'b.txt', data: Uint8Array.of(4) },
    ])
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)

    expect(view.getUint32(0, true)).toBe(0x04034b50)
    expect(Array.from(zip.slice(30 + 5, 30 + 5 + 3))).toEqual([1, 2, 3])

    const end = zip.length - 22
    expect(view.getUint32(end, true)).toBe(0x06054b50)
    expect(view.getUint16(end + 8, true)).toBe(2)
    expect(view.getUint16(end + 10, true)).toBe(2)
  })

  it('sets the UTF-8 file name flag in local and central headers', () => {
    const zip = writeStoredZip([
      { name: 'caf\u00e9.txt', data: Uint8Array.of(1) },
    ])
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)
    const end = zip.length - 22
    const centralStart = view.getUint32(end + 16, true)

    expect(view.getUint16(6, true) & 0x0800).toBe(0x0800)
    expect(view.getUint32(centralStart, true)).toBe(0x02014b50)
    expect(view.getUint16(centralStart + 8, true) & 0x0800).toBe(0x0800)

    const nameLength = view.getUint16(centralStart + 28, true)
    const nameBytes = zip.slice(
      centralStart + 46,
      centralStart + 46 + nameLength,
    )
    expect(new TextDecoder().decode(nameBytes)).toBe('caf\u00e9.txt')
  })

  it('writes the fixed DOS date 1980-01-01 in both headers', () => {
    const zip = writeStoredZip([{ name: 'a.txt', data: Uint8Array.of(1) }])
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)
    const centralStart = view.getUint32(zip.length - 22 + 16, true)

    expect(view.getUint16(10, true)).toBe(0)
    expect(view.getUint16(12, true)).toBe(0x0021)
    expect(view.getUint16(centralStart + 12, true)).toBe(0)
    expect(view.getUint16(centralStart + 14, true)).toBe(0x0021)
  })
})
