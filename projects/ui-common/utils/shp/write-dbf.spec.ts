import { GeoJsonProperties } from 'geojson'
import { parseZip } from 'shpjs'
import { toArrayBuffer } from './testing/shapefile-fixture'
import { writeDbf } from './write-dbf'
import { writeShpAndShx } from './write-shp'
import { writeStoredZip } from './write-zip'

const square: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0],
  [0, 0],
]

async function readBack(
  rows: GeoJsonProperties[],
): Promise<GeoJsonProperties[]> {
  const { shp, shx } = writeShpAndShx(rows.map(() => [square]))
  const zip = writeStoredZip([
    { name: 'test.shp', data: shp },
    { name: 'test.shx', data: shx },
    { name: 'test.dbf', data: writeDbf(rows) },
    { name: 'test.cpg', data: new TextEncoder().encode('UTF-8') },
  ])
  const result = (await parseZip(toArrayBuffer(zip))) as unknown as {
    features: { properties: GeoJsonProperties }[]
  }
  return result.features.map((f) => f.properties)
}

function descriptor(bytes: Uint8Array, index: number) {
  const at = 32 + 32 * index
  const nameBytes = bytes.slice(at, at + 11)
  const end = nameBytes.indexOf(0)
  return {
    name: new TextDecoder().decode(nameBytes.slice(0, end < 0 ? 11 : end)),
    type: String.fromCharCode(bytes[at + 11]),
    width: bytes[at + 16],
    decimals: bytes[at + 17],
  }
}

describe('writeDbf', () => {
  it('round-trips each attribute type', async () => {
    const row = {
      NAME: 'North Quarter',
      FARM: 1234,
      ACRES: 12.5,
      ACTIVE: true,
      PLANTED: new Date(2026, 3, 15),
    }
    const [back] = await readBack([row])
    expect(back).toEqual(row)
  })

  it('writes UTF-8 text', async () => {
    const [back] = await readBack([{ NAME: 'Smith’s “East” Field' }])
    expect(back?.NAME).toBe('Smith’s “East” Field')
  })

  it('fills missing keys with empty values', async () => {
    const rows = [{ A: 'x' }, { B: 2 }]
    const back = await readBack(rows)
    expect(back[0]).toHaveProperty('B')
    expect(back[0]?.B === undefined || Number.isNaN(back[0]?.B)).toBe(true)
    expect(back[1]?.A).toBe('')
    expect(back[1]?.B).toBe(2)
  })

  it('writes empty L values as ? at the byte level', () => {
    const bytes = writeDbf([{ F: true }, { F: null }])
    const header = 32 * 2 + 1
    expect(String.fromCharCode(bytes[header + 1])).toBe('T')
    expect(String.fromCharCode(bytes[header + 2 + 1])).toBe('?')
  })

  it('sizes one N column for mixed numbers', async () => {
    const values = [-3, 12.5, 0.0000001]
    const bytes = writeDbf(values.map((V) => ({ V })))
    expect(descriptor(bytes, 0).decimals).toBeGreaterThanOrEqual(7)
    const back = await readBack(values.map((V) => ({ V })))
    values.forEach((v, i) => expect(back[i]?.V).toBeCloseTo(v, 7))
  })

  it('writes integers with no decimals', () => {
    const bytes = writeDbf([{ N: 1 }, { N: 22 }, { N: 333 }])
    expect(descriptor(bytes, 0)).toMatchObject({
      type: 'N',
      width: 3,
      decimals: 0,
    })
  })

  it('adds an ID column only when no attributes exist', async () => {
    const bytes = writeDbf([null, {}])
    expect(descriptor(bytes, 0)).toMatchObject({ name: 'ID', type: 'N' })
    const back = await readBack([null, {}])
    expect(back.map((p) => p?.ID)).toEqual([1, 2])
    const other = writeDbf([{ NAME: 'a' }, {}])
    expect(descriptor(other, 0).name).toBe('NAME')
    expect(other[32 + 32]).toBe(0x0d)
  })

  it('writes the header and record bytes', () => {
    const bytes = writeDbf([
      { AB: 'xyz', CD: 5 },
      { AB: 'q', CD: 60 },
    ])
    const view = new DataView(bytes.buffer, bytes.byteOffset)
    expect(bytes[0]).toBe(0x03)
    const now = new Date()
    expect(bytes[1]).toBe(now.getFullYear() - 1900)
    expect(view.getUint32(4, true)).toBe(2)
    expect(view.getUint16(8, true)).toBe(32 * 3 + 1)
    expect(view.getUint16(10, true)).toBe(1 + 3 + 2)
    expect(bytes[32 * 3]).toBe(0x0d)
    expect(bytes[32 * 3 + 1]).toBe(0x20)
    expect(bytes.length).toBe(32 * 3 + 1 + 2 * 6 + 1)
    expect(bytes[bytes.length - 1]).toBe(0x1a)
  })

  describe('throws', () => {
    it('for a name longer than 10 characters', () => {
      expect(() => writeDbf([{ seamFeatureKey: 'a' }])).toThrow(
        /"seamFeatureKey"/,
      )
    })
    it('for a non-ASCII name', () => {
      expect(() => writeDbf([{ Näme: 'a' }])).toThrow(/"Näme"/)
    })
    it('for names differing only in case', () => {
      expect(() => writeDbf([{ Name: 'a', NAME: 'b' }])).toThrow(/"NAME"/)
    })
    it('for an empty name', () => {
      expect(() => writeDbf([{ '': 'a' }])).toThrow(/""/)
    })
    it('for an object value', () => {
      expect(() => writeDbf([{ OBJ: { a: 1 } }])).toThrow(/OBJ/)
    })
    it('for an array value', () => {
      expect(() => writeDbf([{ ARR: [1] }])).toThrow(/ARR/)
    })
    it('for NaN', () => {
      expect(() => writeDbf([{ NUM: NaN }])).toThrow(/NUM/)
    })
    it('for mixed string and number', () => {
      expect(() => writeDbf([{ MIX: 'a' }, { MIX: 1 }])).toThrow(/MIX/)
    })
    it('for text over 254 UTF-8 bytes', () => {
      expect(() => writeDbf([{ TXT: 'é'.repeat(128) }])).toThrow(/TXT/)
    })
    it('for an invalid Date', () => {
      expect(() => writeDbf([{ DT: new Date(NaN) }])).toThrow(/DT/)
    })
    it('for a Date year above 9999', () => {
      expect(() => writeDbf([{ DT: new Date(10000, 0, 1) }])).toThrow(/DT/)
    })
    it('for a Date with a negative year', () => {
      const d = new Date(2000, 0, 1)
      d.setFullYear(-5)
      expect(() => writeDbf([{ DT: d }])).toThrow(/DT/)
    })
    it('for a number too wide', () => {
      expect(() => writeDbf([{ BIG: 1e25 }])).toThrow(/BIG/)
    })
  })
})
