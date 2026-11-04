import { MultiPolygon, Polygon } from 'geojson'
import { parseShp } from 'shpjs'
import { toShapefileRings } from './shapefile-rings'
import { toArrayBuffer } from './testing/shapefile-fixture'
import { writeShpAndShx } from './write-shp'

const withHole: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
    [
      [2, 2],
      [2, 4],
      [4, 4],
      [4, 2],
      [2, 2],
    ],
  ],
}

const twoParts: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20],
      ],
    ],
    [
      [
        [40, 40],
        [50, 40],
        [50, 50],
        [40, 50],
        [40, 40],
      ],
    ],
  ],
}

function build() {
  const features = [
    toShapefileRings(withHole, 0),
    toShapefileRings(twoParts, 1),
  ]
  return { features, ...writeShpAndShx(features) }
}

describe('writeShpAndShx', () => {
  it('writes headers both files agree on', () => {
    const { shp, shx } = build()
    const a = new DataView(toArrayBuffer(shp))
    const b = new DataView(toArrayBuffer(shx))

    for (const view of [a, b]) {
      expect(view.getInt32(0)).toBe(9994)
      expect(view.getInt32(28, true)).toBe(1000)
      expect(view.getInt32(32, true)).toBe(5)
    }
    for (const offset of [36, 44, 52, 60]) {
      expect(a.getFloat64(offset, true)).toBe(b.getFloat64(offset, true))
    }
    expect(a.getFloat64(36, true)).toBe(0)
    expect(a.getFloat64(44, true)).toBe(0)
    expect(a.getFloat64(52, true)).toBe(50)
    expect(a.getFloat64(60, true)).toBe(50)
    expect(a.getInt32(24) * 2).toBe(shp.byteLength)
    expect(b.getInt32(24) * 2).toBe(shx.byteLength)
    expect(shx.byteLength).toBe(100 + 8 * 2)
  })

  it('indexes every record in the .shx', () => {
    const { shp, shx } = build()
    const a = new DataView(toArrayBuffer(shp))
    const b = new DataView(toArrayBuffer(shx))

    for (let i = 0; i < 2; i++) {
      const offset = b.getInt32(100 + i * 8) * 2
      expect(a.getInt32(offset)).toBe(i + 1)
      expect(a.getInt32(offset + 4)).toBe(b.getInt32(100 + i * 8 + 4))
    }
  })

  it('round-trips through shpjs parseShp', async () => {
    const { shp, features } = build()
    const geometries = (await parseShp(toArrayBuffer(shp))) as (
      | Polygon
      | MultiPolygon
    )[]

    expect(geometries).toHaveLength(2)
    expect(geometries[0].type).toBe('Polygon')
    expect(geometries[0].coordinates).toHaveLength(2)
    expect(geometries[1].type).toBe('MultiPolygon')
    expect(geometries[1].coordinates).toHaveLength(2)

    const points = (g: Polygon | MultiPolygon) =>
      (g.coordinates as unknown[]).flat(g.type === 'Polygon' ? 1 : 2)
    const key = (p: unknown) => JSON.stringify(p)
    geometries.forEach((g, i) => {
      expect(points(g).map(key).sort()).toEqual(
        features[i].flat().map(key).sort(),
      )
    })
  })
})
